import { GraphQLFieldConfigMap, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLScalarType, GraphQLString } from 'graphql';

import IGDBRequestBuilder from '../services/igdb/builder';
import IGDBService from '../services/igdb/igdb';
import DateTimeScalarType from './datetime';
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
                'url': this.generateField(GraphQLString),
                'createdAt': this.generateField(DateTimeScalarType),
                'updatedAt': this.generateField(DateTimeScalarType)
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
                resolve: async (_: any, queryArgs: NameQuery) => {
                    // don't bother querying when there is no query string
                    if(queryArgs.name) {
                        return await this.convertDate(this.igdbService.getGames(queryArgs.name));
                    }

                    return [];
                }
            }
        };
    }

    private generateField = (type: GraphQLScalarType) =>
        ({ type });

    private async convertDate(builder: IGDBRequestBuilder) {
        const results = await builder.fetch();

        return results.map(result => {
            if(result.created_at) {
                result.createdAt = result.created_at * 1000;
                delete result.created_at;
            }

            if(result.updated_at) {
                result.updatedAt = result.updated_at * 1000;
                delete result.updated_at;
            }

            return result;
        });
    }
}

export default IGDBGraphQL;
