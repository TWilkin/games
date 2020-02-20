import bodyParser from 'body-parser';

import { sequelize } from '../db';

export function initAPI(app, root) {
    app.use(bodyParser.json());

    // the base URLs for the API
    const baseURL = `${root}/api`.replace('//', '/');

    // create common endpoints for each model
    Object.values(sequelize.models).forEach((model) => {
        const url = `${baseURL}/${model.name.toLowerCase()}/`;

        // create the GET endpoint
        app.get(url, async (_, res) => {
            let result = await model.findAll();
            return res.json(result);
        })

        // create the POST endpoint
        app.post(url, async (req, res) => {
            let result = await model.create(req.body);
            return res.json(result);
        });
    });
}
