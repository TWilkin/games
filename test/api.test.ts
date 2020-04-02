import { expect } from 'chai';
import fs from 'fs';
import MockExpressRequest from 'mock-express-request';
import MockExpressResponse from 'mock-express-response';
import { sequelizeMockingMocha } from 'sequelize-mocking';
import tmp from 'tmp';

import API from '../src/api/api';
import { generateData, generateDataArray } from './utility/mock';
import { sequelize } from '../src/db';

describe('API', () => {

    // repeat the tests for each model
    Object.values(sequelize.models).forEach((model) => {
        describe(model.name, () => {
            // initialise the API to test
            const api = new API(model);

            // the data we're going to have in the db to start with
            const testData = generateDataArray(model, 2);

            after(() => {
                // delete the temporary files the tests created
                tmp.setGracefulCleanup();
            });

            sequelizeMockingMocha(
                sequelize,
                writeDataFile(testData),
                { logging: false }
            );

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
                    params: { id: testData[0].data[model.primaryKeyAttribute] }
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
                    params: { id: -1 }
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
                expect(data.gameId).to.be.a('number');
            });

            it('PUT with valid id', async () => {
                const request = new MockExpressRequest({
                    method: 'PUT',
                    params: { id: testData[0].data[model.primaryKeyAttribute] },
                    body: generateData(model, false)
                });
                const response = new MockExpressResponse();
                await api.put(request, response);
                expect(response.statusCode).to.equal(204);
            });

            it('PUT with invalid id', async () => {
                const request = new MockExpressRequest({
                    method: 'PUT',
                    params: { id: -1 },
                    body: generateData(model, false)
                });
                const response = new MockExpressResponse();
                await api.put(request, response);
                expect(response.statusCode).to.equal(404);
            });
        });
    });

});

// sequelize-mocking requires the data in a file, so generate one
function writeDataFile(data: any): string {
    const file = tmp.fileSync({
        mode: 0o644,
        prefix: 'test_data_',
        postfix: '.json'
    });
    fs.writeFileSync(file.name, JSON.stringify(data));
    return file.name;
}
