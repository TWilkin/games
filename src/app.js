import config from 'config';
import express from 'express';

// initialise express with a test route
const app = express();
app.get(config.get('express.root'), (_, res) => {
    res.end(config.get('message'));
});

// start listening
let server = app.listen(config.get('express.port'), () => {
    console.log('Listening on http://%s:%s%s', server.address().address, server.address().port, config.get('express.root'));
});
