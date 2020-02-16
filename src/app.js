import express from 'express';

// the root path the application should listen at
const ROOT_PATH = '/' + (process.env.ROOT_PATH  || '');

// the port number to use or undefined for default
const PORT = (process.env.PORT) ? parseInt(process.env.PORT) : undefined;

// initialise express with a test route
const app = express();
app.get(ROOT_PATH, (_, res) => {
    res.end('Hello World!');
});

// start listening
let server = app.listen(PORT, () => {
    console.log('Listening on http://%s:%s%s', server.address().address, server.address().port, ROOT_PATH);
});
