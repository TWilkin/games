import { expect } from 'chai';
import { graphql, GraphQLInt, GraphQLString } from 'graphql';
import 'mocha';
import sinon from 'sinon';

import GraphQLAPI from '../../src/api/graphql';
import IGDBGraphQL from '../../src/api/igdb';
import IGDBRequestBuilder from '../../src/services/igdb/builder';
import IGDBService from '../../src/services/igdb/igdb';
import { mockContext, mockSequelize } from '../utility/mock';
import { checkQueryResponse, generateQuery } from '../utility/util';

const igdbService = new IGDBService();
const subject = new IGDBGraphQL(igdbService);

// initialise GraphQL
const schema = GraphQLAPI.init(null, null, subject);

describe('IGDB GraphQL', () => {
    mockSequelize();

    afterEach(() => {
        sinon.restore();
    });

    it('Query no parameters', async () => {
        const response = await graphql(
            schema, 
            generateQuery(schema, 'IGDBGame'),
            null,
            mockContext('admin')
        );
        
        checkQueryResponse(response, 'GetIGDBGame', 0);
    });

    it('Query by id', async () => {
        const result = [
            {
                id: 1,
                name: 'Test Game 1',
                url: 'https://igdb.com',
                platforms: [ 101 ],
                created_at: 1612980000,
                updated_at: 1612980900
            },
            {
                id: 10,
                name: 'Test Game 2',
                url: 'https://igdb.com',
                platforms: [ 100 ],
                created_at: 1612980000,
                updated_at: 1612980900
            }
        ];
        sinon.stub(igdbService, 'getGames')
            .callsFake(() => new IGDBRequestBuilder(async () => result));

        const data = {
            name: 'Test'
        };
        const response = await graphql(
            schema, 
            generateQuery(schema, 'IGDBGame', { name: GraphQLString }),
            null,
            mockContext('admin'),
            data
        );
        
        checkQueryResponse(response, 'GetIGDBGame', 1);
        
        for(let i = 0; i < result.length; i++) {
            const record = response.data?.GetIGDBGame?.[i];
            expect(record?.id).to.equal(result[i].id);
            expect(record?.name).to.equal(result[i].name);
            expect(record?.url).to.equal(result[i].url);
            expect(record?.createdAt).to.equal('2021-02-10T18:00:00Z');
            expect(record?.updatedAt).to.equal('2021-02-10T18:15:00Z');
            expect(record?.platforms)
                .which.is.not.null
                .and.length.is.equal(i);
        }
    });
});
