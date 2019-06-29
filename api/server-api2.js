import EnturService from '@entur/sdk';
import { VariableType } from 'json-to-graphql-query';

import express from "express";
import moment from "moment";
import fetch from "isomorphic-fetch";

import log from "./serverlog.js";
import { latLongDistance, latLonToUTM, utmToLatLong } from "../public/js/util/ruteutils";

let publisher = null;

var jsonHeaders = new Headers({
    "Content-Type": "application/json",
    "Accept": "application/json",
});

var createRequest = function (method, body) {
    return {
        method: method,
        headers: jsonHeaders,
        body: body,
        timeout: 5 * 1000, // timeout in ms: https://github.com/bitinn/node-fetch#options
    };
};

var api = express();
export default api;

const clientName = 'raskrute';
const entur = new EnturService({ clientName: clientName });

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
            log('error fetching ', URL, err);
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
            log('error fetching ', URL, err);
            res.status(500).json({error: 'server error'});
        });
});

const stopPlaceQuery = {
    query: {
        __variables: {
            id: 'String!'
        },
        stopPlace: {
            __args: {
                id: new VariableType('id'),
            },
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            transportMode: true,
            estimatedCalls: {
                __args: {
                    numberOfDepartures: 20,
                },
                aimedDepartureTime: true,
                expectedDepartureTime: true,
                destinationDisplay: {
                    frontText: true,
                },
                serviceJourney: {
                    id: true,
                    line: {
                        publicCode: true,
                        name: true,
                        notices: {
                            id: true,
                            text: true,
                            publicCode: true,
                        }
                    }
                }
            },
            quays: {
                id: true,
                name: true,
            }
        }
    }
};

api.get('/routes/:stopId', (req, res) => {
    const stopId = req.params.stopId;
    if (!stopId || !stopId.length || stopId.length < 1) {
        res.status(400).json({error: 'bad param stopId'});
        return;
    }

    const remapToRuter = (data = {}) => {
        data = data.stopPlace || data;

        const avganger = (data.estimatedCalls || [])
            .map(call => {
                const Extensions = {
                    // TODO: find Deviations
                    Deviations: [],
                    // TODO: find LineColour
                    LineColour: '',
                };

                const mvj = {
                    DestinationName: call.destinationDisplay.frontText,
                    PublishedLineName: call.serviceJourney.line.publicCode,
                    LineRef: call.serviceJourney.line.publicCode,
                    MonitoredCall: {
                        AimedDepartureTime: call.aimedDepartureTime,
                        ExpectedDepartureTime: call.expectedDepartureTime,
                        DestinationDisplay: call.destinationDisplay.frontText,
                    },
                    VehicleJourneyName: call.serviceJourney.id,
                };

                return {
                    //...call,
                    Extensions: Extensions,
                    MonitoredVehicleJourney: mvj,
                    MonitoringRef: call.serviceJourney.id,
                };
            });

        return {
            ...data,
            ID: data.id,
            Name: data.name,
            PlaceType: 'Stop',
            avganger: avganger,
        };
    };

    entur.journeyPlannerQuery(stopPlaceQuery, { id: stopId })
        .then(result => result.data)
        .then(remapToRuter)
        .then(data => res.json(data))
        .catch(err => {
            log('error get stopid: ', err);
            res.status(500);
        });
});

// eg. https://reisapi.ruter.no/Place/GetClosestStops?coordinates=(x=600268,y=6644331)
// coordinates in UTM32 format.
// See: https://reisapi.ruter.no/Help/Api/GET-Place-GetClosestStops_coordinates_proposals_maxdistance
const API_CLOSEST_URL = '/Place/GetClosestStops?coordinates=(x=${X},y=${Y})';

function placeByPositionToRuterStop(stop, location) {
    let utm = latLonToUTM(stop.latitude, stop.longitude);
    const coords = {
        latitude: stop.latitude,
        longitude: stop.longitude,
        X: utm.X,
        Y: utm.Y,
    };

    const distance_km = latLongDistance(coords, location);

    return {
        ...stop,
        ...coords,
        PlaceType: 'Stop',
        ID: stop.id,
        Name: stop.name,
        // we dont have this information here
        District: '',
        distance_meters: distance_km * 1000,
        distance: distance_km,
    };
}

const distance_meters = 500;

api.post('/closest', (req, res) => {
    const { X, Y } = req.body;
    if (!X || !Y) {
        res.status(400).json({ error: `X or Y param is not valid. Got: X=${X} Y=${Y}` });
        return;
    }

    const URL = `${HOST_V2}/Place/GetClosestStops?coordinates=(x=${X},y=${Y})&maxdistance=1400&proposals=15`;

    const coords = utmToLatLong(Y, X);

    log('coords=', coords);

    return entur.getStopPlacesByPosition(coords, distance_meters)
      .then(stops => (stops || []))
      .then(stops => {
          console.log('stops=%O', stops);
          return stops;
      })
      .then(stops => stops
        .filter(stop => stop.id.indexOf('StopPlace') > -1)
        .map(stop => placeByPositionToRuterStop(stop, coords))
        .sort((a, b) => a.distance_meters > b.distance_meters)
      )
      .then(stops => res.json(stops))
      .catch(err => {
          log('Error with getFeatures', err);
          res.status(500).json({ message: err });
      });
});

function stopToRuterStop(stop) {
    const geometry = stop.geometry.coordinates || [];

    const coords = {};
    if (geometry.length === 2) {
        const [ lat, lon ] = geometry;
        coords.latitude = lat;
        coords.longitude = lon;

        const { X, Y } = latLonToUTM(lat, lon);
        coords.X = X;
        coords.Y = Y;
    }

    return {
        ...stop,
        ...coords,
        PlaceType: 'Stop',
        ID: stop.properties.id,
        Name: stop.properties.name,
        District: stop.properties.county,
    };
}

api.get('/search/:text', (req, res) => {
    const text = req.params.text;
    if (!text || !text.length || text.length < 3) {
        res.json([]);
        return;
    }

  return entur.getFeatures(text)
    .then(stops => stops
      .filter(stop => stop.properties.id.indexOf('StopPlace') > -1)
      .map(stopToRuterStop))
    .then(stops => res.json(stops))
    .catch(err => {
      log('error with getFeatures', err);
      res.json([]);
    });
});
