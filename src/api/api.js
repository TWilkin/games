import bodyParser from 'body-parser';

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
            let result = await model.findAll();
            return res.json(result);
        });

        // create the GET by id endpoint
        app.get(`${url}/:id`, async (req, res) => {
            let result = await model.findByPk(req.params.id);
            return res.json(result);
        });

        // create the POST endpoint
        app.post(url, async (req, res) => {
            let result = await model.create(req.body);
            return res.json(result);
        });

        // create the PUT endpoint
        app.put(`${url}/:id`, async (req, res) => {
            // create the query
            const primaryKey = Object.values(model.rawAttributes).find(field => field.primaryKey).fieldName;
            const query = { where: { }};
            query.where[primaryKey] = req.params.id;

            let result = await model.update(req.body, query);
            return res.json(result);
        });
    });
}
