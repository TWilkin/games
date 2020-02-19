import config from 'config';
import express from 'express';

import { Game } from './models/game';

// initialise express with a test route
const app = express();
app.get(config.get('express.root'), (_, res) => {
    res.end(config.get('message'));
});

// add test db routes
app.get(config.get('express.root') + 'add', async (_, res) => {
    await Game.create({
        title: 'Minecraft'
    });
    
    res.end('Success');
});
app.get(config.get('express.root') + 'get', async (_, res) => {
    const games = await Game.findAll();
    res.end(JSON.stringify(games, null, 2));
});

// start listening
const port = config.get('express.port') > 0 ? config.get('express.port') : undefined;
let server = app.listen(port, () => {
    console.log('Listening on http://%s:%s%s', server.address().address, server.address().port, config.get('express.root'));
});
