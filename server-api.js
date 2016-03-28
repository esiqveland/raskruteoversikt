'use strict';

var express = require('express');
var moment = require('moment');
var fetch = require('isomorphic-fetch');

var jsonHeaders = new Headers({
  "Content-Type": "application/json",
  "Accept": "application/json",
});

var createRequest = function (method, body) {
  return {
    method: method,
    headers: jsonHeaders,
    body: body,
    timeout: 10*1000, // timeout in ms: https://github.com/bitinn/node-fetch#options
  };
};

var api = express();
module.exports = api;

var TEST_DATA = require('./testroute.js');

// const HOST = 'http://reis.trafikanten.no';
const HOST_V2 = 'https://reisapi.ruter.no';


const STOPID_GET_DEPARTURES = '/StopVisit/GetDepartures/{stopId}';
const STOPS_FOR_LINE_V2 = '/Place/GetStopsByLineID/{LineRef}';
const STOPS_IN_JOURNEY = '/Trip/GetTrip/{VehicleJourneyName}?time={DDMMYYYYhhmmss}';
const FIND_PLACES_V2 = '/Place/GetPlaces/{searchText}';
const GET_STOP_ID_V2 = '/Place/GetStop/{stopId}';

const FindJourney = (req, res) => {
  let VehicleJourneyName = req.params.VehicleJourneyName;
  let Time = req.params.Time;
  if (!VehicleJourneyName || !VehicleJourneyName.length || VehicleJourneyName.length < 1) {
    res.status(400).json({error: 'bad param VehicleJourneyName'});
    return;
  }
  if (!Time || !Time.length || Time.length < 1) {
    // res.status(400).json({error: 'bad param Time'});
    // return;

    // guess we want the journey closest to now.
    Time = moment().format('DDMMYYYYhhmmss');
  }

  const URL = HOST_V2 + STOPS_IN_JOURNEY
      .replace('{VehicleJourneyName}', VehicleJourneyName)
      .replace('{DDMMYYYYhhmmss}', Time);
  fetch(URL, createRequest('GET'))
    .then(resp => resp.json())
    .then(jsonData => res.json(jsonData))
    .catch(err => {
      console.log('error fetching ', URL, err);
      res.status(500).json({error: 'server error'});
    });
};

// Get stops on this Journey
api.get('/journey/:VehicleJourneyName', FindJourney);

api.get('/journey/:VehicleJourneyName/:Time', FindJourney);

// Get stops for a line/LineRef
api.get('/lines/:LineRef', (req, res) => {
  const LineRef = req.params.LineRef;
  if (!LineRef || !LineRef.length || LineRef.length < 1) {
    res.status(400).json({error: 'bad param LineRef'});
    return;
  }

  const URL = HOST_V2 + STOPS_FOR_LINE_V2.replace('{LineRef}', LineRef);
  fetch(URL, createRequest('GET'))
    .then((resp) => resp.json())
    .then(jsonData => res.json(jsonData))
    .catch(err => {
      console.log('error fetching ', URL, err);
      res.status(500).json({error: 'server error'});
    });
});

api.get('/routes/:stopId/realtime', (req, res) => {
  const stopId = req.params.stopId;
  if (!stopId || !stopId.length || stopId.length < 1) {
    res.status(400).json({error: 'bad param stopId'});
    return;
  }
  const URL = HOST_V2 + STOPID_GET_DEPARTURES.replace('{stopId}', stopId);
  fetch(URL, createRequest("GET"))
    .then((response) => response.json())
    .then((jsondata) => res.json(jsondata))
    .catch((err) => {
      console.log('error fetching ', URL, err);
      res.status(500).json({error: 'server error'});
    })
});

api.get('/routes/:stopId', (req, res) => {
  const stopId = req.params.stopId;
  if (!stopId || !stopId.length || stopId.length < 1) {
    res.status(400).json({error: 'bad param stopId'});
    return;
  }
  const URL = HOST_V2 + GET_STOP_ID_V2.replace('{stopId}', stopId);
  const URL_DEPARTURES = HOST_V2 + STOPID_GET_DEPARTURES.replace('{stopId}', stopId);

  // res.json(TEST_DATA);

  var operations = [fetch(URL, createRequest("GET")), fetch(URL_DEPARTURES, createRequest("GET"))];
  Promise.all(operations)
    .then((responses) => Promise.all(responses.map(response => response.json())))
    .then((responses) => {
      let rute = responses[0];
      rute.avganger = responses[1] || [];
      return Promise.resolve(rute);
    })
    .then(jsonData => res.json(jsonData))
    .catch(error => {
      console.log('error fetching: ', error);
      res.status(500).json({error: 'server error'});
    });
});

api.get('/search/:text', (req, res) => {
  const text = req.params.text;
  if (!text || !text.length || text.length < 3) {
    res.json([]);
    return;
  }
  const URL = HOST_V2 + FIND_PLACES_V2.replace('{searchText}', text);
  fetch(URL, createRequest("GET"))
    .then((response) => response.json())
    .then((jsondata) => res.json(jsondata))
    .catch((error) => {
      console.log('error fetching ', URL, error);
      res.json([]);
    })
});
