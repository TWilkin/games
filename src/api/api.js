import bodyParser from 'body-parser';
const HttpStatus = require('http-status-codes');

import { sequelize } from '../db';
import '../models/models';

export function initAPI(app, root) {
    app.use(bodyParser.json());

    // the base URLs for the API
    const baseURL = `${root}/api`.replace('//', '/');

    // create common endpoints for each model
    Object.values(sequelize.models).forEach((model) => {
        const url = `${baseURL}/${model.name.toLowerCase()}`;

        // create the GET endpoint
        app.get(url, async (_, res) => {
            let data = await model.findAll();
            generateResponse(data, res);
        });

        // create the GET by id endpoint
        app.get(`${url}/:id`, async (req, res) => {
            let data = await model.findByPk(req.params.id);
            generateResponse(data, res);
        });

        // create the POST endpoint
        app.post(url, async (req, res) => {
            let data = await model.create(req.body);
            generateResponse(data, res);
        });

        // create the PUT endpoint
        app.put(`${url}/:id`, async (req, res) => {
            // create the query
            const primaryKey = Object.values(model.rawAttributes).find(field => field.primaryKey).fieldName;
            const query = { where: { }};
            query.where[primaryKey] = req.params.id;

            let data = await model.update(req.body, query);

            // send the response based on what (if anything) was updated
            if(data[0] == 0) {
                generateResponse(undefined, res);
            }
            generateResponse(undefined, res, HttpStatus.NO_CONTENT);
        });
    });
}

function generateResponse(data, res, ifNull=HttpStatus.NOT_FOUND) {
    if(!data || Object.keys(data).length == 0 ) {
        res.status(ifNull).send();
    } else {
        // check if we created a new record
        if(data.isNewRecord) {
            res.status(HttpStatus.CREATED);
        }
        res.json(data);
    }
}
