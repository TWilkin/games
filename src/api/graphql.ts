import { Express } from 'express';
import graphqlHTTP from 'express-graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLScalarType, GraphQLString, GraphQLFieldConfigMap, GraphQLObjectTypeConfig, GraphQLList, GraphQLInputObjectType, GraphQLFieldConfig, GraphQLInputFieldConfig, GraphQLInputFieldConfigMap, GraphQLNonNull } from 'graphql';
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
            fields: () => GraphQLAPI.generateFields(Object.values(model.rawAttributes), false) as GraphQLInputFieldConfigMap
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

    private static generateFields(fields: ModelAttributeColumnOptions[], includeId=true): 
            GraphQLFieldConfigMap<any, any, any> | GraphQLInputFieldConfig
    {
        let f = {};
        fields
            .filter(field => includeId || !field.primaryKey)
            .forEach(field => {
                f[field.field as string] = {
                    type: this.generateType(field)
                };
            });
        return f;
    }

    private static generateType(field: ModelAttributeColumnOptions): GraphQLScalarType {
        switch((field.type as AbstractDataType).key) {
    
            case DataTypes.INTEGER.toString():
                return GraphQLInt;
            
            case DataTypes.DATE.toString():
                return DateTimeScalarType;
            
            case DataTypes.STRING.toString():
            default:
                return GraphQLString;
        }
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
