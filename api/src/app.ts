import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { AddressInfo } from 'net';
import fetch from 'node-fetch';

import Auth from './api/auth';
import Configuration from './config';
import GraphQLAPI from './api/graphql';

// add fetch to global
if(!globalThis.fetch) {
    globalThis.fetch = fetch;
}

// initialise express
const app = express();
app.use(cors({ 
    origin: true,
    methods: 'POST',
    allowedHeaders: ['Authorization', 'Content-Type', 'Cookie'],
    credentials: true
}));
app.use(bodyParser.json());

// add authentication middleware
const auth = Auth.init(app);

// add the API routes
GraphQLAPI.init(app, auth);

// start listening
let server = app.listen(Configuration.getExpress.port, () => {
    const { address, port } = server.address() as AddressInfo;
    console.log('Listening on http://%s:%s%s', address, port, Configuration.getExpress.root);
});
