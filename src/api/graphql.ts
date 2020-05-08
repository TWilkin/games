import { Express } from 'express';
import graphqlHTTP from 'express-graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFieldConfigMap, GraphQLObjectTypeConfig, GraphQLList, GraphQLInputObjectType, GraphQLInputFieldConfigMap, GraphQLNonNull, GraphQLNullableType, GraphQLType, GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { Model, ModelCtor, ModelAttributeColumnOptions, AbstractDataType, DataTypes, FindOptions, UpdateOptions, IncludeOptions, CreateOptions, Sequelize } from 'sequelize';

import Auth, { AuthenticatedRequest } from './auth';
import { sequelize } from '../db';
import DateTimeScalarType from './datetime';
import { isInputSecret, isQueryable, isResultSecret } from './decorators';
import User from '../models/user.model';

export interface GraphQLContext {
    database: Sequelize,
    user?: User
};

export interface GraphQLUpdateOptions extends UpdateOptions {
    context: GraphQLContext
};

export default class GraphQLAPI {

    // the list of models
    private static models: GraphQLAPI[] = [];

    // the GraphQL schema
    private static schema: GraphQLSchema;

    // the sequelize model
    private model: ModelCtor<Model<any, any>>;

    // the GraphQL type
    private type: GraphQLObjectType;

    // the GraphQL input type
    private input: GraphQLInputObjectType;

    constructor(model: ModelCtor<Model<any, any>>) {
        this.model = model;

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
            resolve: (_: any, args: any, __: any, info: GraphQLResolveInfo) => {
                let query: FindOptions = this.restrictColumns(info);

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
            resolve: (_: any, { input }, context: GraphQLContext) => {
                return model.create(input, context as CreateOptions);
            }
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
            resolve: async (_, { id, input }, context: GraphQLContext) => {
                // create the query (assume no composite primary keys)
                const query: GraphQLUpdateOptions = { 
                    where: { },
                    individualHooks: true,
                    context: context
                };
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
            // Input should not include the primary key, updatedAt or createdAt
            .filter(field => !(isInput && (field.primaryKey || 'updatedAt' === field.field || 'createdAt' === field.field)))
            // don't include if it's a secret for the input or results
            .filter(field => (isInput && !isInputSecret(field)) || (!isInput && !isResultSecret(field)))
            .forEach(field => {
                fields[field.field as string] = {
                    type: GraphQLAPI.generateType(field),
                    defaultValue: field.defaultValue
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
                        type: this.model.associations[key].isMultiAssociation ? new GraphQLList(type.type) : type.type
                    };
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

    private restrictColumns(info: GraphQLResolveInfo): FindOptions {
        const originalModel = this.model;
        const result: FindOptions = {
            attributes: [],
            include: []
        };

        // the function to restrict the nested columns
        const restrictNestedColumns = function(obj: any, current: IncludeOptions) {
            const model = current.model ? current.model : originalModel;

            if(model) {
                // always add the primary key
                (current.attributes as string[]).push(model.primaryKeyAttribute);

                // add the keys of this join
                Object.keys(obj)
                    .map(key => {
                        if(Object.keys(obj[key]).length > 0) {
                            // find the model to join
                            const joinKey = Object.keys(model.associations)
                                .find(association => association == key) as string;

                            // add this model to the includes
                            const child: IncludeOptions = {
                                model: model.associations[joinKey].target,
                                include: [],
                                attributes: []
                            };
                            current.include?.push(child);

                            // recursively restrict
                            restrictNestedColumns(obj[key], child);
                        } else {
                            // add this field to the attributes
                            (current.attributes as string[]).push(key);
                        }
                    });
            }
        };

        // find the lists of columns and models
        restrictNestedColumns(graphqlFields(info), result);
        return result;
    }
    
    public static init(app: Express | null, root: string, auth: Auth | null): GraphQLSchema {
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
                auth ? auth.getHandlers : [],
                graphqlHTTP((req) => ({
                    schema: GraphQLAPI.schema,
                    context: {
                        database: sequelize,
                        user: (req as AuthenticatedRequest).user
                    },
                    graphiql: true
                }))
            );
        }

        return GraphQLAPI.schema;
    }
}
