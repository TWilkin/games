import { expect } from 'chai';
import { graphql } from 'graphql';
import { sequelizeMockingMocha } from 'sequelize-mocking';

import GraphQLAPI from '../src/api/graphql';
import { sequelize } from '../src/db';
import { generateQuery, generateMutation } from './utility/util';
import { generateData } from './utility/mock';

// initialise GraphQL
const schema = GraphQLAPI.init(null, '');

describe('GraphQL', () => {

    sequelizeMockingMocha(
        sequelize,
        `${__dirname}/data.json`,
        { logging: false }
    );

    // repeat the tests for each model
    Object.values(sequelize.models).forEach((model) => {
        describe(model.name, () => {
            it('Query no parameter', async () => {
                let queryName = `Get${model.name}`;
                let response = await graphql(schema, generateQuery(model));
                expect(response).to.be.not.null;
                expect(response.errors).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data as object)[queryName]).to.be.not.null;
                expect((response.data as object)[queryName].length).to.equal(2);
            });

            it('Mutation add', async () => {
                let queryName = `Add${model.name}`;
                let data = {
                    input: generateData(model, false, false)
                };
                let response = await graphql(schema, generateMutation(model), null, null, data);
                expect(response).to.be.not.null;
                expect(response.errors).to.be.undefined;
                expect(response.data).to.be.not.null;
                expect((response.data as object)[queryName]).to.be.not.null;
                expect((response.data as object)[queryName]).to.not.be.an('array');
                expect((response.data as object)[queryName][model.primaryKeyAttribute]).to.be.a('number');
            });
        });
    });

});
