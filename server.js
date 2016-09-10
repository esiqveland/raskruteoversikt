'use strict';

var http = require('http');
var path = require('path');
var fs = require('fs');
var fetch = require('isomorphic-fetch');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var winston = require('winston'),
  expressWinston = require('express-winston');
require('winston-loggly');

var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var express = require('express');

var config = {
  port: process.env.PORT || 9999,
  servedir: process.env.PUBLIC_FOLDER || 'dist/'
};


var cors = function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET PUT POST DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type Accept');
  next();
};

if(process.env.LOGGLY_TOKEN) {
  console.log('Configured winston with a LOGGLY_TOKEN');
  winston.add(winston.transports.Loggly, {
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ["raskrute-frontend"],
    json: true,
  });
}

var app = express();
var api = require('./api/server-api');

app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(cors);

app.use(expressWinston.logger({
  winstonInstance: winston,
}));
// config
// app.use(express.cookieParser());
// app.use(express.session({ secret: 'cool beans' }));
// app.use(express.methodOverride());
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(express.static(path.join(__dirname, config.servedir)));

app.use('/api', api);

app.get('*', function (req, res, next) {
  let potentialFile = req.url.split('/');
  potentialFile = potentialFile[potentialFile.length - 1];

  const filePath = path.join(__dirname, config.servedir, potentialFile);
  let stat = false;
  try {
    stat = fs.statSync(filePath);
  } catch (err) {
    stat = false;
  }
  if (stat) {
    res.sendFile(filePath);
  } else {
    next();
  }
});

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, config.servedir, 'index.html'));
});

app.listen(config.port, function () {
  console.log('server is listening on port ' + config.port);
  console.log('server is dealing: ' + config.servedir);
});

