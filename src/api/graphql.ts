import { Express } from 'express';
import graphqlHTTP from 'express-graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFieldConfigMap, GraphQLObjectTypeConfig, GraphQLList, GraphQLInputObjectType, GraphQLInputFieldConfigMap, GraphQLNonNull, GraphQLNullableType, GraphQLType } from 'graphql';
import { Model, ModelCtor, ModelAttributeColumnOptions, AbstractDataType, DataTypes } from 'sequelize';

import { sequelize } from '../db';
import DateTimeScalarType from './datetime';

// the list of models
let models: GraphQLAPI[] = [];

export default class GraphQLAPI {

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
            fields: () => GraphQLAPI.generateFields(Object.values(model.rawAttributes)) as GraphQLFieldConfigMap<any, any, any>
        });
        this.input  = new GraphQLInputObjectType({
            name: `${model.name}Input`,
            fields: () => GraphQLAPI.generateFields(Object.values(model.rawAttributes), true) as GraphQLInputFieldConfigMap
        });
    }

    private appendQuery(query: GraphQLObjectTypeConfig<any, any, any>) {
        const model = this.model;
        query.fields[`Get${model.name}`] = {
            type: new GraphQLList(this.type),
            resolve: () => model.findAll()
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
            resolve: (_, { input }) => model.create(input)
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

    private static generateFields(fields: ModelAttributeColumnOptions[], isInput=false): 
            GraphQLFieldConfigMap<any, any, any> | GraphQLInputFieldConfigMap
    {
        let f = {};
        fields
            .filter(field => !(isInput && (field.primaryKey || 'updatedAt' === field.field || 'createdAt' === field.field)))
            .forEach(field => {
                f[field.field as string] = {
                    type: this.generateType(field)
                };
            });
        return f;
    }

    private static generateType(field: ModelAttributeColumnOptions): GraphQLType {
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
        if(!field.allowNull) {
            type = new GraphQLNonNull(type);
        }

        return type;
    }
    
    public static init(app: Express, root: string) {
        // create a GraphQL model for each Sequelize model
        models = Object.values(sequelize.models)
            .map(model => new GraphQLAPI(model));

        // add the queries
        const queries: GraphQLObjectTypeConfig<any, any, any> = {
            name: 'Query',
            fields: {}
        };
        models.forEach(model => model.appendQuery(queries));

        // add the mutations
        const mutations: GraphQLObjectTypeConfig<any, any, any> = {
            name: 'Mutation',
            fields: {}
        };
        models.forEach(model => model.appendMutation(mutations));

        // merge the types and inputs
        const types: any[] = models
            .map(model => model.input)
            .concat(models.map(model => model.input));

        // generate the schema
        const schema = new GraphQLSchema({
            query: new GraphQLObjectType(queries),
            mutation: new GraphQLObjectType(mutations),
            types: types
        });

        // add the GraphQL endpoint
        app.use(
            `${root}/graphql`.replace('//', '/'),
            graphqlHTTP({
                schema: schema,
                graphiql: true
            })
        );
    }
}
