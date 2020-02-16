import express from 'express';

// the root path the application should listen at
const ROOT_PATH = '/' + (process.env.ROOT_PATH  || '');

const app = express();
app.get(ROOT_PATH, (req, res) => {
    res.end('Hello World!');
});

// start listening to default host and port
let server = app.listen(() => {
    console.log('Listening on http://%s:%s%s', server.address().address, server.address().port, ROOT_PATH);
});
