import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { AddressInfo } from 'net';
import fetch from 'node-fetch';

import Auth from './api/auth';
import Configuration from './config';
import GraphQLAPI from './api/graphql';
import IGDB from './services/igdb/igdb';
import ImageController from './api/image';
import IGDBGraphQL from './api/igdb';

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

// initialise IGDB
const igdbService = new IGDB();
const igdbGraphQL = new IGDBGraphQL(igdbService);

// add the API routes
GraphQLAPI.init(app, auth, igdbGraphQL);
ImageController.init(app, igdbService);

// TEMP for testing IGDB
app.use(`${Configuration.getExpress.root}/igdb/covers/:id`.replace('//', '/'), async (req, res) => {
    const result = await igdbService.getCover(parseInt(req.params.id)).fetch();
    res.json(result);
});
app.use(`${Configuration.getExpress.root}/igdb/games/:name`.replace('//', '/'), async (req, res) => {
    const result = await igdbService.getGames(req.params.name).fetch();
    res.json(result);
});
app.use(`${Configuration.getExpress.root}/igdb/platforms/:name`.replace('//', '/'), async (req, res) => {
    const result = await igdbService.getPlatforms(req.params.name).fetch();
    res.json(result);
});

// start listening
const server = app.listen(Configuration.getExpress.port, () => {
    const { address, port } = server.address() as AddressInfo;
    console.log('Listening on http://%s:%s%s', address, port, Configuration.getExpress.root);
});
