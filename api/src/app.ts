import bodyParser from 'body-parser';
import express from 'express';
import { AddressInfo } from 'net';

import Auth from './api/auth';
import Configuration from './config';
import GraphQLAPI from './api/graphql';

// initialise express
const app = express();
app.use(bodyParser.json())

// add authentication middleware
const auth = Auth.init(app);

// add the API routes
GraphQLAPI.init(app, auth);

// start listening
let server = app.listen(Configuration.getExpress.port, () => {
    const { address, port } = server.address() as AddressInfo;
    console.log('Listening on http://%s:%s%s', address, port, Configuration.getExpress.root);
});
