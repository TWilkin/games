import bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import { AddressInfo } from 'net';

import Auth from './api/auth';
import GraphQLAPI from './api/graphql';

// initialise express with a test route
const app = express();
app.get(config.get('express.root'), (_, res) => {
    res.end(config.get('message'));
});

// add authentication middleware
app.use(bodyParser.json())
Auth.init(app, config.get('express.root'));

// add the API routes
GraphQLAPI.init(app, config.get('express.root'));

// start listening
const port: number | undefined = config.get('express.port') as number > 0 ? config.get('express.port') : undefined;
let server = app.listen(port, () => {
    const { address, port } = server.address() as AddressInfo;
    console.log('Listening on http://%s:%s%s', address, port, config.get('express.root'));
});
