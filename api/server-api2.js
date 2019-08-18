import EnturService from '@entur/sdk';
import { VariableType } from 'json-to-graphql-query';

import express from "express";
import moment from "moment-timezone";
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

export const journeyQuery = {
    query: {
        __variables: {
            id: 'String!'
        },
        serviceJourney: {
            __args: {
                id: new VariableType('id'),
            },
            id: true,
            publicCode: true,
            line: {
                id: true,
                name: true,
                publicCode: true,
                transportMode: true,
            },

            passingTimes: {
                departure: {
                    time: true,
                    dayOffset: true,
                },
                arrival: {
                    time: true,
                    dayOffset: true,
                },
                timingPoint: true,
                quay: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                    publicCode: true,
                    stopPlace: {
                        id: true,
                        name: true,
                    },
                    situations: {
                        summary: {
                            value: true,
                            language: true,
                        },
                        severity: true,
                        description: {
                            value: true,
                            language: true,
                        },
                    },
                },
            },
            quays: {
                id: true,
                name: true,
                description: true,
            }
        }
    }
};

const FindJourney = (req, res) => {
    let VehicleJourneyName = req.params.VehicleJourneyName;
    if (!VehicleJourneyName || !VehicleJourneyName.length || VehicleJourneyName.length < 1) {
        res.status(400).json({ error: 'bad param VehicleJourneyName' });
        return;
    }

    entur.journeyPlannerQuery(journeyQuery, { id: VehicleJourneyName })
        .then(res => res.data)
        .then(res => res.serviceJourney)
        .then(journey => {
            const now = moment.utc().tz('Europe/Oslo');

            const stops = journey.passingTimes
                .map(passingTime => {

                    let departureTime = null;
                    if (passingTime.departure) {
                        const dayOffset = passingTime.departure.dayOffset;
                        const dayTime = passingTime.departure.time;
                        const [ dayHour, dayMinute, daySecond ] = dayTime.split(':');
                        departureTime = now
                            .add(dayOffset, 'day')
                            .set('hour', dayHour)
                            .set('minute', dayMinute)
                            .set('second', daySecond)
                            .format();
                    }

                    let arrivalTime = null;
                    if (passingTime.arrival) {
                        const dayArrivalOffset = passingTime.arrival.dayOffset;
                        const dayArrivalTime = passingTime.arrival.time;
                        const [ dayArrivalHour, dayArrivalMinute, dayArrivalSecond ] = dayArrivalTime.split(':');

                        arrivalTime = now
                            .add(dayArrivalOffset, 'day')
                            .set('hour', dayArrivalHour)
                            .set('minute', dayArrivalMinute)
                            .set('second', dayArrivalSecond)
                            .format();
                    }

                    return {
                        ...passingTime,
                        Name: passingTime.quay.name,
                        ArrivalTime: arrivalTime,
                        DepartureTime: departureTime,
                    }
                });

            return {
                ...journey,
                Stops: stops,
            };
        })
        .then(journey => {
            res.json(journey);
        })
        .catch(err => {
            log('error loading journey: ', err);
            res.status(500).json({ error: err });
        })
};

// Get stops on this Journey
api.get('/journey/:VehicleJourneyName', FindJourney);

api.get('/journey/:VehicleJourneyName/:Time', FindJourney);

// Get stops for a line/LineRef
api.get('/lines/:LineRef', (req, res) => {
    const LineRef = req.params.LineRef;
    if (!LineRef || !LineRef.length || LineRef.length < 1) {
        res.status(400).json({ error: 'bad param LineRef' });
        return;
    }

    const URL = HOST_V2 + STOPS_FOR_LINE_V2.replace('{LineRef}', LineRef);
    fetch(URL, createRequest('GET'))
        .then((resp) => resp.json())
        .then(jsonData => res.json(jsonData))
        .catch(err => {
            log('error fetching ', URL, err);
            res.status(500).json({ error: 'server error' });
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
                realtime: true,
                realtimeState: true,
                aimedDepartureTime: true,
                expectedDepartureTime: true,
                destinationDisplay: {
                    frontText: true,
                },
                quay: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                },
                serviceJourney: {
                    id: true,
                    line: {
                        publicCode: true,
                        name: true,
                        transportMode: true,
                        transportSubmode: true,
                        situations: {
                            id: true,
                            severity: true,
                            reportType: true,
                            advice: {
                                value: true,
                                language: true,
                            },
                            summary: {
                                value: true,
                                language: true,
                            },
                            description: {
                                value: true,
                                language: true,
                            },
                            infoLinks: {
                                uri: true,
                                label: true,
                            },
                        },
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
                latitude: true,
                longitude: true,
                lines: [{
                    transportMode: true,
                }]
            }
        }
    }
};

api.get('/routes/:stopId', (req, res) => {
    const stopId = req.params.stopId;
    if (!stopId || !stopId.length || stopId.length < 1) {
        res.status(400).json({ error: 'bad param stopId' });
        return;
    }

    const remapToRuter = (data = {}) => {
        data = data.stopPlace || data;

        const modesRaw = (data.quays || [])
            .flatMap(quay => (quay.lines || []))
            .map(line => line.transportMode)
            .reduce((a, b) => {
                a.add(b);

                return a;
            }, new Set());

        const modes = Array.from(modesRaw);

        const avganger = (data.estimatedCalls || [])
            .map(call => {
                const serviceJourney = call.serviceJourney;

                const deviations = serviceJourney.line.situations
                    .map(sit => {
                        const summary = sit.summary
                            .reduce((a, b) => {
                                a[b.language] = b.value;
                                return a;
                            }, {});
                        const advice = sit.advice
                            .reduce((a, b) => {
                                a[b.language] = b.value;
                                return a;
                            }, {});

                        const description = sit.description
                            .reduce((a, b) => {
                                a[b.language] = b.value;
                                return a;
                            }, {});

                        return {
                            id: sit.id,
                            summary: summary,
                            advice: advice,
                            description: description,
                        };
                    });

                const Extensions = {
                    // TODO: find Deviations
                    Deviations: deviations,
                    // TODO: find LineColour
                    LineColour: '',
                };

                const mvj = {
                    DestinationName: call.destinationDisplay.frontText,
                    PublishedLineName: serviceJourney.line.publicCode,
                    LineRef: serviceJourney.line.publicCode,
                    MonitoredCall: {
                        AimedDepartureTime: call.aimedDepartureTime,
                        ExpectedDepartureTime: call.expectedDepartureTime,
                        DestinationDisplay: call.destinationDisplay.frontText,
                    },
                    VehicleJourneyName: serviceJourney.id,
                };

                return {
                    ...call,
                    Extensions: Extensions,
                    MonitoredVehicleJourney: mvj,
                    MonitoringRef: serviceJourney.id,
                };
            });

        return {
            ...data,
            ID: data.id,
            Name: data.name,
            PlaceType: 'Stop',
            avganger: avganger,
            modes: modes,
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
    if (!text || !text.length || text.length < 2) {
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
