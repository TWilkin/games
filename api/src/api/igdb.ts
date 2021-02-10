import { GraphQLFieldConfigMap, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLScalarType, GraphQLString } from 'graphql';

import Platform from '../models/platform.model';
import IGDBRequestBuilder from '../services/igdb/builder';
import IGDBService from '../services/igdb/igdb';
import DateTimeScalarType from './datetime';
import GraphQLAPI, { GraphQLExtension } from './graphql';

interface IGDBQuery {
    id?: number;
    name?: string;
}

class IGDBGraphQL implements GraphQLExtension {
    constructor(private igdbService: IGDBService) { }

    generateType(models: GraphQLAPI[]): GraphQLObjectType<any, any, any> {
        const platformModel = models.find(model => model.getType.name === 'Platform');
        if(!platformModel) {
            // should not happen
            throw new Error();
        }

        return new GraphQLObjectType({
            name: 'IGDBGame',
            fields: {
                'id': this.generateField(GraphQLInt),
                'name': this.generateField(GraphQLString),
                'platforms': {
                    type: new GraphQLList(platformModel.getType)
                },
                'url': this.generateField(GraphQLString),
                'createdAt': this.generateField(DateTimeScalarType),
                'updatedAt': this.generateField(DateTimeScalarType)
            } as GraphQLFieldConfigMap<any, any, any>
        });
    }

    generateQuery(models: GraphQLAPI[]): GraphQLFieldConfigMap<any, any, any> {
        const args = {
            id: this.generateField(GraphQLInt),
            name: this.generateField(GraphQLString)
        };

        return {
            'GetIGDBGame': {
                type: new GraphQLList(this.generateType(models)),
                args,
                resolve: async (_: any, queryArgs: IGDBQuery) => {
                    // don't bother querying when there is no query
                    if(queryArgs.id || queryArgs.name) {
                        return await this.updateResults(
                            this.igdbService.getGames(queryArgs.id, queryArgs.name)
                        );
                    }

                    return [];
                }
            }
        };
    }

    private generateField = (type: GraphQLScalarType) =>
        ({ type });

    private async updateResults(builder: IGDBRequestBuilder) {
        const [ results, platforms ] = await Promise.all([
            builder.fetch(),
            Platform.findAll()
        ]);

        return results.map(result => {
            if(result.created_at) {
                result.createdAt = result.created_at * 1000;
                delete result.created_at;
            }

            if(result.updated_at) {
                result.updatedAt = result.updated_at * 1000;
                delete result.updated_at;
            }

            // convert the IGDB platform ids to local platform ids
            if(result.platforms?.length > 0) {
                result.platforms = result.platforms
                    .map(igdbPlatform => 
                        platforms.find(platform => platform.igdbId === igdbPlatform)
                    ).filter((platform: Platform | undefined | null) => platform !== undefined && platform !== null);
            }

            return result;
        });
    }
}

export default IGDBGraphQL;
