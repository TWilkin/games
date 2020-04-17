import { expect } from 'chai';
import { graphql } from 'graphql';
import { sequelizeMockingMocha } from 'sequelize-mocking';

import GraphQLAPI from '../src/api/graphql';
import { sequelize } from '../src/db';
import { generateQuery } from './utility/util';

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
        });
    });

});
