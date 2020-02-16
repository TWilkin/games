import express from 'express';

const app = express();
app.get('/test/', (req, res) => {
    res.end('Hello World!');
});

// start listening to default host and port
let server = app.listen(() => {
    console.log('Listening on http://%s,%s', server.address().address, server.address().port);
});
