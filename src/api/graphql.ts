import { Express } from 'express';
import graphqlHTTP from 'express-graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFieldConfigMap, GraphQLObjectTypeConfig, GraphQLList, GraphQLInputObjectType, GraphQLInputFieldConfigMap, GraphQLNonNull, GraphQLNullableType, GraphQLType } from 'graphql';
import { Model, ModelCtor, ModelAttributeColumnOptions, AbstractDataType, DataTypes, FindOptions, Includeable } from 'sequelize';

import { sequelize } from '../db';
import DateTimeScalarType from './datetime';
import { isQueryable } from './queryable';

export default class GraphQLAPI {

    // the list of models
    private static models: GraphQLAPI[] = [];

    // the GraphQL schema
    private static schema: GraphQLSchema;

    // the sequelize model
    private model: ModelCtor<Model<any, any>>;

    // the tables to include when making a query using sequelize
    private includes: Includeable[];

    // the GraphQL type
    private type: GraphQLObjectType;

    // the GraphQL input type
    private input: GraphQLInputObjectType;

    constructor(model: ModelCtor<Model<any, any>>) {
        this.model = model;

        // generate the includes for any referenced fields
        this.includes = Object
                .values(this.model.associations)
                .map(association => association.target);

        this.type = new GraphQLObjectType({
            name: model.name,
            fields: () => this.generateFields() as GraphQLFieldConfigMap<any, any, any>
        });
        this.input  = new GraphQLInputObjectType({
            name: `${model.name}Input`,
            fields: () => this.generateFields(true) as GraphQLInputFieldConfigMap
        });
    }

    public get getModel(): ModelCtor<Model<any, any>> {
        return this.model;
    }

    private appendQuery(query: GraphQLObjectTypeConfig<any, any, any>) {
        const model = this.model;

        // generate the query args with default id and any other queryable column
        let args = {
            id: {
                type: GraphQLInt
            }
        };
        Object.values(this.model.rawAttributes)
            .filter(field => isQueryable(field))
            .forEach(field => {
                args[field.field as string] = {
                    type: GraphQLAPI.generateType(field, true)
                };
            });

        query.fields[`Get${model.name}`] = {
            type: new GraphQLList(this.type),
            args: args,
            resolve: (_: any, args: any) => {
                let query: FindOptions = {
                    include: this.includes
                };

                if(args) {
                    // replace args.id with the actual name of the field
                    if(args.id) {
                        args[model.primaryKeyAttribute] = args.id;
                        delete args.id;
                    }

                    query.where = args;
                }
                
                return model.findAll(query);
            }
        };
    }

    private appendMutation(mutation: GraphQLObjectTypeConfig<any, any, any>) {
        const model = this.model;

        // the AddX mutation
        mutation.fields[`Add${model.name}`] = {
            type: this.type,
            args: {
                input: {
                    type: new GraphQLNonNull(this.input)
                }
            },
            resolve: (_: any, { input }) => model.create(input)
        };

        // the UpdateX mutation
        mutation.fields[`Update${model.name}`] = {
            type: this.type,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                input: {
                    type: new GraphQLNonNull(this.input)
                }
            },
            resolve: async (_, { id, input }) => {
                // create the query (assume no composite primary keys)
                const query: any = { where: { } };
                query.where[model.primaryKeyAttribute] = id;
                const data = await model.update(input, query);

                // if it worked, return the updated data
                if(data[0] == 0) {
                    return null;
                }
                return model.findByPk(id);
            }
        };
    }

    private generateFields(isInput=false): 
            GraphQLFieldConfigMap<any, any, any> | GraphQLInputFieldConfigMap
    {
        let fields = {};

        // iterate over the database fields
        Object.values(this.model.rawAttributes)
            .filter(field => !(isInput && (field.primaryKey || 'updatedAt' === field.field || 'createdAt' === field.field)))
            .forEach(field => {
                fields[field.field as string] = {
                    type: GraphQLAPI.generateType(field)
                };
            });
        
        // add the referenced fields
        if(!isInput) {
            Object.keys(this.model.associations)
                .forEach(key => {
                    // check if this type has been created already
                    const type = GraphQLAPI.models.find(model => model.model == this.model.associations[key].target);
                    if(!type) {
                        throw new Error(`Cannot find GraphQL type for field ${key}`);
                    }

                    fields[key] = {
                        type: type.type
                    }
                });
        }
        
        return fields;
    }

    private static generateType(field: ModelAttributeColumnOptions, query=false): GraphQLType {
        let type: GraphQLNullableType;

        switch((field.type as AbstractDataType).key) {
    
            case DataTypes.INTEGER.toString():
                type = GraphQLInt;
                break;
            
            case DataTypes.DATE.toString():
                type = DateTimeScalarType;
                break;
            
            case DataTypes.STRING.toString():
            default:
                type = GraphQLString;
                break;
        }

        // check if this type should be nullable
        if(!query && !field.allowNull) {
            type = new GraphQLNonNull(type);
        }

        return type;
    }
    
    public static init(app: Express | null, root: string): GraphQLSchema {
        // create a GraphQL model for each Sequelize model
        Object.values(sequelize.models)
            .forEach(model => GraphQLAPI.models.push(new GraphQLAPI(model)));

        // add the queries
        const queries: GraphQLObjectTypeConfig<any, any, any> = {
            name: 'Query',
            fields: {}
        };
        GraphQLAPI.models.forEach(model => model.appendQuery(queries));

        // add the mutations
        const mutations: GraphQLObjectTypeConfig<any, any, any> = {
            name: 'Mutation',
            fields: {}
        };
        GraphQLAPI.models.forEach(model => model.appendMutation(mutations));

        // generate the schema
        GraphQLAPI.schema = new GraphQLSchema({
            query: new GraphQLObjectType(queries),
            mutation: new GraphQLObjectType(mutations)
        });

        // add the GraphQL endpoint
        if(app) {
            app.use(
                `${root}/graphql`.replace('//', '/'),
                graphqlHTTP({
                    schema: GraphQLAPI.schema,
                    graphiql: true
                })
            );
        }

        return GraphQLAPI.schema;
    }
}
