// entry point for the web application to support use of ESM6 syntax
require('@babel/register')({});
require('babel-polyfill');
module.exports = require('./app.js');
