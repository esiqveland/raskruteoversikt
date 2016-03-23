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

var TEST_DATA = require('./testroute.js');

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
var api = express();

const HOST = 'http://reis.trafikanten.no';
const FIND_PLACES = '/ReisRest/Place/FindMatches/{searchText}';
const GET_ROUTE_ID_DEPARTURES = '/ReisRest/RealTime/GetRealTimeData/{routeId}';
const GET_ROUTE_ID = '/ReisRest/Place/FindMatches/{routeId}';

api.get('/routes/:routeId/departures', (req, res) => {
  const routeId = req.params.routeId;
  if (!routeId || !routeId.length || routeId.length < 1) {
    res.status(400).json({error: 'bad param routeId'});
    return;
  }
  const URL = HOST + GET_ROUTE_ID_DEPARTURES.replace('{routeId}', routeId);
  fetch(URL)
    .then((response) => response.json())
    .then((jsondata) => res.json(jsondata))
    .catch((error) => {
      console.log('error fetching ', URL, error);
      res.status(500).json({error: 'server error'});
    })
});

api.get('/routes/:routeId', (req, res) => {
  const routeId = req.params.routeId;
  if (!routeId || !routeId.length || routeId.length < 1) {
    res.status(400).json({error: 'bad param routeId'});
    return;
  }
  const URL = HOST + GET_ROUTE_ID.replace('{routeId}', routeId);
  const URL_DEPARTURES = HOST + GET_ROUTE_ID_DEPARTURES.replace('{routeId}', routeId);

  res.json(TEST_DATA);
  
  // var operations = [fetch(URL), fetch(URL_DEPARTURES)];
  // Promise.all(operations)
  //   .then((responses) => Promise.all(responses.map(response => response.json())))
  //   .then((responses) => {
  //     let rute = responses[0][0];
  //     rute.avganger = responses[1];
  //     return Promise.resolve(rute);
  //   })
  //   .then(jsonData => res.json(jsonData))
  //   .catch(error => {
  //     console.log('error fetching: ', error);
  //     res.status(500).json({error: 'server error'});
  //   });
});

api.get('/search/rute/:text', (req, res) => {
  const text = req.params.text;
  if (!text || !text.length || text.length < 3) {
    res.json([]);
    return;
  }
  const URL = HOST + FIND_PLACES.replace('{searchText}', text);
  fetch(URL)
    .then((response) => response.json())
    .then((jsondata) => res.json(jsondata))
    .catch((error) => {
      console.log('error fetching ', URL, error);
      res.json([]);
    })
});

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

app.listen(config.port, function () {
  console.log('server is listening on port ' + config.port);
  console.log('server is dealing: ' + config.servedir);
});

