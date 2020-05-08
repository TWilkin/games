import bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import { AddressInfo } from 'net';

import Auth from './api/auth';
import GraphQLAPI from './api/graphql';

// initialise express
const app = express();
app.use(bodyParser.json())

// add authentication middleware
const auth = Auth.init(app, config.get('express.root'));

// add a protected test route
app.get(
    config.get('express.root'), 
    auth.getHandlers,
    (_, res) => {
        res.end(config.get('message'));
    }
);

// add the API routes
GraphQLAPI.init(app, config.get('express.root'));

// start listening
const port: number | undefined = config.get('express.port') as number > 0 ? config.get('express.port') : undefined;
let server = app.listen(port, () => {
    const { address, port } = server.address() as AddressInfo;
    console.log('Listening on http://%s:%s%s', address, port, config.get('express.root'));
});
