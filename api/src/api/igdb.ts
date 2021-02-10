import { GraphQLFieldConfigMap, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLScalarType, GraphQLString, GraphQLType } from 'graphql';
import IGDBService from '../services/igdb/igdb';
import { GraphQLExtension } from './graphql';

interface NameQuery {
    name: string;
}

class IGDBGraphQL implements GraphQLExtension {
    constructor(private igdbService: IGDBService) { }

    generateType(): GraphQLObjectType<any, any, any> {
        return new GraphQLObjectType({
            name: 'IGDBGame',
            fields: {
                'id': this.generateField(GraphQLInt),
                'name': this.generateField(GraphQLString),
                'url': this.generateField(GraphQLString)
            } as GraphQLFieldConfigMap<any, any, any>
        });
    }

    generateQuery(): GraphQLFieldConfigMap<any, any, any> {
        const args = {
            name: this.generateField(GraphQLString)
        };

        return {
            'GetIGDBGame': {
                type: new GraphQLList(this.generateType()),
                args,
                resolve: async (_: any, queryArgs: NameQuery) => 
                    await this.igdbService.getGames(queryArgs.name).fetch()
            }
        };
    }

    private generateField = (type: GraphQLScalarType) =>
        ({ type });
}

export default IGDBGraphQL;
