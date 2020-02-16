// entry point for the web application to support use of ESM6 syntax
require('@babel/register')({});
module.exports = require('./app.js');
