import { Express } from 'express';
import graphqlHTTP from 'express-graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLScalarType, GraphQLString, GraphQLFieldConfigMap, GraphQLObjectTypeConfig, GraphQLList } from 'graphql';
import { Model, ModelCtor, ModelAttributeColumnOptions, AbstractDataType, DataTypes } from 'sequelize';

import { sequelize } from '../db';
import DateTimeScalarType from './datetime';

// the list of models
let models: GraphQLAPI[] = [];

export default class GraphQLAPI {

    private model: ModelCtor<Model<any, any>>;

    private type: GraphQLObjectType;

    constructor(model: ModelCtor<Model<any, any>>) {
        this.model = model;
        this.type = new GraphQLObjectType({
            name: model.name,
            fields: () => GraphQLAPI.generateFields(Object.values(model.rawAttributes))
        });
    }

    private appendQuery(query: GraphQLObjectTypeConfig<any, any, any>) {
        const model = this.model;
        query.fields[`Get${model.name}`] = {
            type: new GraphQLList(this.type),
            resolve: () => model.findAll()
        }
    }

    private static generateFields(fields: ModelAttributeColumnOptions[]): GraphQLFieldConfigMap<any, any, any> {
        let f = {};
        fields.forEach(field => {
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
        console.log(models.map(m => m.toString()));

        // add the queries
        const queries: GraphQLObjectTypeConfig<any, any, any> = {
            name: 'Query',
            fields: {}
        };
        models.forEach(model => model.appendQuery(queries));

        // generate the schema
        const schema = new GraphQLSchema({
            query: new GraphQLObjectType(queries),
            types: models.map(model => model.type)
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
