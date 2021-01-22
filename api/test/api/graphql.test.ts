import { expect } from 'chai';
import { ExecutionResult, graphql, GraphQLInt } from 'graphql';
import { ExecutionResultDataDefault } from 'graphql/execution/execute';
import 'mocha';
import { Model, ModelCtor } from 'sequelize';

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

                checkQueryResponse(response, queryName, 2);
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
                
                checkQueryResponse(response, queryName, 1);
            });

            it('Mutation add', async () => {
                const mutationName = `Add${model.name}`;
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
                
                checkMutationResponse(response, mutationName, model);
            });

            it('Mutation update with valid id', async () => {
                const mutationName = `Update${model.name}`;
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
                
                checkMutationResponse(response, mutationName, model);
            });

            it('Mutation update with invalid id', async () => {
                const mutationName = `Update${model.name}`;
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
                
                checkMutationResponse(response, mutationName, model)
                    .which.is.be.null;
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

                    checkQueryResponse(response, queryName, 1)
                        .which.satisfies((result: { gamePlatform: { platformId: number; }; }) => 
                            result?.gamePlatform?.platformId == data.platformId
                        );
                });
            }
        });
    });
});

function checkResponse(response: ExecutionResult<ExecutionResultDataDefault>, queryName: string) {
    expect(response).to.be.not.null;

    expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;

    expect(response.data).to.be.not.null;
    return expect(response.data).to.have.key(queryName);
}

function checkQueryResponse(response: ExecutionResult<ExecutionResultDataDefault>, queryName: string, length: number) {
    return checkResponse(response, queryName)
        .which.is.not.null
        .and.length.is.equal(length);
}

function checkMutationResponse(response: ExecutionResult<ExecutionResultDataDefault>, mutationName: string, model: ModelCtor<Model<any, any>>) {
    return checkResponse(response, mutationName)
        .which.is.not.null
        .and.is.not.an('array')
        .which.has.key(model.primaryKeyAttribute)
        .which.is.a('number');
}
