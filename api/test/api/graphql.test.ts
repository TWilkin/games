import { expect } from 'chai';
import { graphql, GraphQLInt } from 'graphql';
import 'mocha';

import GraphQLAPI from '../../src/api/graphql';
import { sequelize } from '../../src/db';
import { generateQuery, generateMutation } from '../utility/util';
import { generateData, mockContext, mockSequelize } from '../utility/mock';

// initialise GraphQL
const schema = GraphQLAPI.init(null, null);

describe('GraphQL', () => {

    mockSequelize();

    // repeat the tests for each model
    Object.values(sequelize.models).forEach((model) => {
        describe(model.name, () => {
            it('Query no parameter', async () => {
                const queryName = `Get${model.name}`;
                const response = await graphql(
                    schema, 
                    generateQuery(schema, model.name),
                    null,
                    mockContext('admin')
                );
                expect(response).to.be.not.null;
                expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data)[queryName]).to.be.not.null;
                expect((response.data)[queryName].length).to.equal(2);
            });

            it('Query with valid id', async () => {
                const queryName = `Get${model.name}`;
                const data = {
                    id: 1
                };
                const response = await graphql(
                    schema, 
                    generateQuery(schema, model.name, { id: GraphQLInt }), 
                    null, 
                    mockContext('admin'), 
                    data
                );
                expect(response).to.be.not.null;
                expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data)[queryName]).to.be.not.null;
                expect((response.data)[queryName].length).to.equal(1);
            });

            it('Mutation add', async () => {
                const queryName = `Add${model.name}`;
                const data = {
                    input: generateData(schema, model.name)
                };
                const response = await graphql(
                    schema, 
                    generateMutation(model, true), 
                    null, 
                    mockContext('admin'),
                    data
                );
                expect(response).to.be.not.null;
                expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data)[queryName]).to.be.not.null;
                expect((response.data)[queryName]).to.not.be.an('array');
                expect((response.data)[queryName][model.primaryKeyAttribute]).to.be.a('number');
            });

            it('Mutation update with valid id', async () => {
                const queryName = `Update${model.name}`;
                const data = {
                    id: 1,
                    input: generateData(schema, model.name)
                };
                const response = await graphql(
                    schema, 
                    generateMutation(model, false), 
                    null,
                    mockContext('admin'), 
                    data
                );
                expect(response).to.be.not.null;
                expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data)[queryName]).to.be.not.null;
                expect((response.data)[queryName]).to.not.be.an('array');
                expect((response.data)[queryName][model.primaryKeyAttribute]).to.be.a('number');
            });

            it('Mutation update with invalid id', async () => {
                const queryName = `Update${model.name}`;
                const data = {
                    id: 3,
                    input: generateData(schema, model.name)
                };
                const response = await graphql(
                    schema, 
                    generateMutation(model, false), 
                    null, 
                    mockContext('admin'), 
                    data
                );
                expect(response).to.be.not.null;
                expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data)[queryName]).to.be.null;
            });

            if(model.name === 'GameCollection' || model.name === 'GameWishlist') {
                it('Query with nested query parameter', async () => {
                    const queryName = `Get${model.name}`;
                    const data = {
                        platformId: 2
                    };
                    const response = await graphql(
                        schema, 
                        `query($platformId: Int) { Get${model.name}(platformId: $platformId) { gamePlatform { platformId } } }`, 
                        null, 
                        mockContext('admin'), 
                        data
                    );
                    expect(response).to.be.not.null;
                    expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                    expect(response.data).to.be.not.null;
                    expect((response.data)[queryName]).to.be.not.null;
                    expect((response.data)[queryName].length).to.equal(1);
                    expect((response.data)[queryName][0]['gamePlatform']['platformId']).to.equal(data.platformId);
                });
            }
        });
    });
});
