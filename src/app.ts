import { AddressInfo } from 'net';
import config from 'config';
import express from 'express';

import { initAPI } from './api/api';

// initialise express with a test route
const app = express();
app.get(config.get('express.root'), (_, res) => {
    res.end(config.get('message'));
});

// add the API routes
initAPI(app, config.get('express.root'));

// start listening
const port: number | undefined = config.get('express.port') as number > 0 ? config.get('express.port') : undefined;
let server = app.listen(port, () => {
    const { address, port } = server.address() as AddressInfo;
    console.log('Listening on http://%s:%s%s', address, port, config.get('express.root'));
});
