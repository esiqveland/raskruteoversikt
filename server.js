'use strict';

var http = require('http');
var path = require('path');
var fetch = require('isomorphic-fetch');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var express = require('express');

var config = {
  port: process.env.PORT || 9999,
  servedir: process.env.PUBLIC_FOLDER || 'dist/'
};


var cors = function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'reis.trafikanten.no');
  res.setHeader('Access-Control-Allow-Methods', 'GET PUT POST DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type Accept');
  next();
};

var app = express();
var api = require('./server-api');

// config
app.use(bodyParser.json());
// app.use(express.cookieParser());
// app.use(express.session({ secret: 'cool beans' }));
// app.use(express.methodOverride());
app.use(cors);
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, config.servedir)));

app.use('/api', api);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/dist/index.html'));
});

app.listen(config.port, function () {
  console.log('server is listening on port ' + config.port);
  console.log('server is dealing: ' + config.servedir);
});

