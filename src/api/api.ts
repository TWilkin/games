import bodyParser from 'body-parser';
import { Express, Response } from 'express';
import HttpStatus from 'http-status-codes';

import { sequelize } from '../db';

export function initAPI(app: Express, root: string) {
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
            // create the query (assume no composite primary keys)
            const primaryKey = model.primaryKeyAttribute;
            const query: any = { where: { } };
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

function generateResponse(data: any, res: Response<any>, ifNull=HttpStatus.NOT_FOUND) {
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
