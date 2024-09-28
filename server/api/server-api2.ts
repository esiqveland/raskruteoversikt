import EnturService  from '@entur/sdk';
import type { Feature, StopPlace } from '@entur/sdk';
import { VariableType } from 'json-to-graphql-query';

import express, { type Request, type Response } from "express";

import log from "./serverlog";
import { latLongDistance, latLonToUTM, utmToLatLong } from "./ruteutils";

var api = express();
export default api;

const clientName = 'raskrute';
const entur = new EnturService({ clientName: clientName });

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
                operator: {
                    id: true,
                    name: true,
                },
                presentation: {
                    colour: true,
                    textColour: true,
                }
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
                        id: true,
                        // creationTime: true,
                        infoLinks: {
                            // url: true,
                            label: true,
                        },
                        advice: {
                            value: true,
                            language: true,
                        },
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

const FindJourney = (req: Request, res: Response) => {
    let VehicleJourneyName = req.params['VehicleJourneyName'];
    if (!VehicleJourneyName || !VehicleJourneyName.length || VehicleJourneyName.length < 1) {
        res.status(400).json({ error: 'bad param VehicleJourneyName' });
        return;
    }

    entur.journeyPlannerQuery(journeyQuery, { id: VehicleJourneyName })
        .then((res: any) => res.data || res)
        .then((res: any) => res.serviceJourney)
        .then((journey: any) => res.json(journey))
        .catch((err: any) => {
            log('error loading journey: ', err);
            res.status(500).json({ error: err });
        })
};

// Get stops on this Journey
api.get('/journey/:VehicleJourneyName', FindJourney);
api.get('/journey/:VehicleJourneyName/:Time', FindJourney);

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
                    numberOfDepartures: 100,
                    numberOfDeparturesPerLineAndDestinationDisplay: 5,
                    timeRange: 86400,
                },
                realtime: true,
                realtimeState: true,
                cancellation: true,
                aimedDepartureTime: true,
                expectedDepartureTime: true,
                destinationDisplay: {
                    frontText: true,
                },
                notices: {
                    id: true,
                    text: true,
                    publicCode: true,
                },
                situations: {
                    id: true,
                    // v3:
                    //creationTime: true,
                    infoLinks: {
                        // v3:
                        // url: true,
                        label: true,
                    },
                    advice: {
                        value: true,
                        language: true,
                    },
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
                        operator: {
                            id: true,
                            name: true,
                        },
                        presentation: {
                            colour: true,
                            textColour: true,
                        },
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
    const stopId = req.params.stopId || '';
    if (!stopId || !stopId.length || stopId.length < 1) {
        res.status(400).json({ error: 'bad param stopId' });
        return;
    }

    const remapToRuter = (data: any = {}) => {
        data = data.stopPlace || data;

        const modesRaw = (data.quays || [])
            .flatMap((quay: any) => (quay.lines || []))
            .map((line: { transportMode: any; }) => line.transportMode)
            .reduce((a: Set<string>, b: string) => {
                a.add(b);

                return a;
            }, new Set());

        const modes = Array.from(modesRaw);

        return {
            ...data,
            PlaceType: 'Stop',
            modes: modes,
        };
    };

    entur.journeyPlannerQuery(stopPlaceQuery, { id: stopId })
        .then((result: any) => result.data || result)
        .then(remapToRuter)
        .then((data: any) => res.json(data))
        .catch((err: any) => {
            log('error get stopid: ', err);
            res.status(500);
        });
});

// eg. https://reisapi.ruter.no/Place/GetClosestStops?coordinates=(x=600268,y=6644331)
// coordinates in UTM32 format.
// See: https://reisapi.ruter.no/Help/Api/GET-Place-GetClosestStops_coordinates_proposals_maxdistance
const API_CLOSEST_URL = '/Place/GetClosestStops?coordinates=(x=${X},y=${Y})';

function placeByPositionToRuterStop(stop: StopPlace, location: { latitude: number, longitude: number }) {
    let utm = latLonToUTM(stop.latitude, stop.longitude);
    const coords: Coords = {
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

    const coords = utmToLatLong(Y, X);

    log('coords=', coords);

    return entur.getStopPlacesByPosition(coords, distance_meters)
        .then((stops: any) => (stops || []))
        .then((stops: any) => {
            return stops;
        })
        .then((stops: any[]) => stops
            .filter(stop => stop.id.indexOf('StopPlace') > -1)
            .map(stop => placeByPositionToRuterStop(stop, coords))
            .sort((a, b) => a.distance_meters - b.distance_meters)
        )
        .then((stops: any) => res.json(stops))
        .catch((err: any) => {
            log('Error with getFeatures', err);
            res.status(500).json({ message: err });
        });
});

export interface Coords {
    latitude: number
    longitude: number
    X: number
    Y: number
}
function stopToRuterStop(stop: Feature) {
    const geometry = stop.geometry.coordinates || [];

    let coords: Coords | undefined;
    if (geometry.length === 2) {
        const [ lat, lon ] = geometry;
        const { X, Y } = latLonToUTM(lat, lon);
        coords = {
            latitude: lat,
            longitude: lon,
            X: X,
            Y: Y,
        }
    }

    return {
        ...stop,
        ...coords,
        PlaceType: 'Stop',
        id: stop.properties.id,
        name: stop.properties.name,
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
        .then((stops: any[]) => stops
            .filter(stop => stop.properties.id.indexOf('StopPlace') > -1)
            .map(stopToRuterStop))
        .then((stops: any) => res.json(stops))
        .catch((err: any) => {
            log('error with getFeatures', err);
            res.json([]);
        });
});
