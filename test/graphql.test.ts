import { expect } from 'chai';
import { graphql, GraphQLInt } from 'graphql';

import GraphQLAPI from '../src/api/graphql';
import { sequelize } from '../src/db';
import { generateQuery, generateMutation } from './utility/util';
import { generateData, mockContext, mockSequelize } from './utility/mock';

// initialise GraphQL
const schema = GraphQLAPI.init(null, '', null);

describe('GraphQL', () => {

    mockSequelize();

    // repeat the tests for each model
    Object.values(sequelize.models).forEach((model) => {
        describe(model.name, () => {
            it('Query no parameter', async () => {
                let queryName = `Get${model.name}`;
                let response = await graphql(
                    schema, 
                    generateQuery(schema, model.name),
                    null,
                    mockContext('admin')
                );
                expect(response).to.be.not.null;
                expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data as object)[queryName]).to.be.not.null;
                expect((response.data as object)[queryName].length).to.equal(2);
            });

            it('Query with valid id', async () => {
                let queryName = `Get${model.name}`;
                let data = {
                    id: 1
                };
                let response = await graphql(
                    schema, 
                    generateQuery(schema, model.name, { id: GraphQLInt }), 
                    null, 
                    mockContext('admin'), 
                    data
                );
                expect(response).to.be.not.null;
                expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data as object)[queryName]).to.be.not.null;
                expect((response.data as object)[queryName].length).to.equal(1);
            });

            it('Mutation add', async () => {
                let queryName = `Add${model.name}`;
                let data = {
                    input: generateData(schema, model.name)
                };
                let response = await graphql(
                    schema, 
                    generateMutation(model, true), 
                    null, 
                    mockContext('admin'),
                    data
                );
                expect(response).to.be.not.null;
                expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data as object)[queryName]).to.be.not.null;
                expect((response.data as object)[queryName]).to.not.be.an('array');
                expect((response.data as object)[queryName][model.primaryKeyAttribute]).to.be.a('number');
            });

            it('Mutation update with valid id', async () => {
                let queryName = `Update${model.name}`;
                let data = {
                    id: 1,
                    input: generateData(schema, model.name)
                };
                let response = await graphql(
                    schema, 
                    generateMutation(model, false), 
                    null,
                    mockContext('admin'), 
                    data
                );
                expect(response).to.be.not.null;
                expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data as object)[queryName]).to.be.not.null;
                expect((response.data as object)[queryName]).to.not.be.an('array');
                expect((response.data as object)[queryName][model.primaryKeyAttribute]).to.be.a('number');
            });

            it('Mutation update with invalid id', async () => {
                let queryName = `Update${model.name}`;
                let data = {
                    id: 3,
                    input: generateData(schema, model.name)
                };
                let response = await graphql(
                    schema, 
                    generateMutation(model, false), 
                    null, 
                    mockContext('admin'), 
                    data
                );
                expect(response).to.be.not.null;
                expect(response.errors, JSON.stringify(response.errors)).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data as object)[queryName]).to.be.null;
            });
        });
    });

});
