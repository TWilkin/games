import config from 'config';
import express from 'express';

// initialise express with a test route
const app = express();
app.get(config.get('express.root'), (_, res) => {
    res.end(config.get('message'));
});

// start listening
const port = config.get('express.port') > 0 ? config.get('express.port') : undefined;
let server = app.listen(port, () => {
    console.log('Listening on http://%s:%s%s', server.address().address, server.address().port, config.get('express.root'));
});
