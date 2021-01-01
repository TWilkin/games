import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { AddressInfo } from 'net';
import fetch from 'node-fetch';

import Auth from './api/auth';
import Configuration from './config';
import GraphQLAPI from './api/graphql';
import IGDB from './services/igdb/igdb';

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

// TEMP for testing IGDB
const service = new IGDB();
app.use(`${Configuration.getExpress.root}/igdb/games/:name`.replace('//', '/'), async (req, res) => {
    let result = await service.getGames(req.params.name);
    res.json(result);
});
app.use(`${Configuration.getExpress.root}/igdb/platforms/:name`.replace('//', '/'), async (req, res) => {
    let result = await service.getPlatforms(req.params.name);
    res.json(result);
});

// start listening
let server = app.listen(Configuration.getExpress.port, () => {
    const { address, port } = server.address() as AddressInfo;
    console.log('Listening on http://%s:%s%s', address, port, Configuration.getExpress.root);
});
