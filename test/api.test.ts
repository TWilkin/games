import { expect } from 'chai';
import MockExpressRequest from 'mock-express-request';
import MockExpressResponse from 'mock-express-response';
import { sequelizeMockingMocha } from 'sequelize-mocking';

import API from '../src/api/api';
import { generateData } from './utility/mock';
import { sequelize } from '../src/db';

describe('API', () => {

    sequelizeMockingMocha(
        sequelize,
        `${__dirname}/data.json`,
        { logging: false }
    );

    // repeat the tests for each model
    Object.values(sequelize.models).forEach((model) => {
        describe(model.name, () => {
            // initialise the API to test
            const api = new API(model);

            it('GET no parameter', async () => {
                const response = new MockExpressResponse();
                await api.get(new MockExpressRequest(), response);
                const data = response._getJSON();
                expect(response.statusCode).to.equal(200);
                expect(data).to.be.not.null;
                expect(data.length).to.equal(2);
            });

            it('GET with valid id', async () => {
                const request = new MockExpressRequest({
                    params: { id: 1 }
                });
                const response = new MockExpressResponse();
                await api.get(request, response);
                const data = response._getJSON();
                expect(response.statusCode).to.equal(200);
                expect(data).to.be.not.null;
                expect(data).to.not.be.an('array');
            });

            it('GET with invalid id', async () => {
                const request = new MockExpressRequest({
                    params: { id: 3 }
                });
                const response = new MockExpressResponse();
                await api.get(request, response);
                expect(response.statusCode).to.equal(404);
            });

            it('POST', async () => {
                const request = new MockExpressRequest({
                    method: 'POST',
                    body: generateData(model, false)
                });
                const response = new MockExpressResponse();
                await api.post(request, response);
                const data = response._getJSON();
                expect(response.statusCode).to.equal(200);
                expect(data).to.be.not.null;
                expect(data).to.not.be.an('array');
                expect(data[model.primaryKeyAttribute]).to.be.a('number');
            });

            it('PUT with valid id', async () => {
                const request = new MockExpressRequest({
                    method: 'PUT',
                    params: { id: 1 },
                    body: generateData(model, false)
                });
                const response = new MockExpressResponse();
                await api.put(request, response);
                expect(response.statusCode).to.equal(204);
            });

            it('PUT with invalid id', async () => {
                const request = new MockExpressRequest({
                    method: 'PUT',
                    params: { id: 3 },
                    body: generateData(model, false)
                });
                const response = new MockExpressResponse();
                await api.put(request, response);
                expect(response.statusCode).to.equal(404);
            });
        });
    });

});
