import { point, lineString } from '@turf/helpers';
import bbox from '@turf/bbox';
import destination from '@turf/destination';
import createEnturClient  from '@entur/sdk';
import type { Feature, StopPlace } from '@entur/sdk';
import { gql, GraphQLClient } from 'graphql-request'

import express, { type Request, type Response } from "express";

import log from "./serverlog";
import { latLongDistance, latLonToUTM, utmToLatLong } from "./ruteutils";

var api = express();
export default api;

const journeyPlannerV3Url = 'https://api.entur.io/journey-planner/v3/graphql';
const client = new GraphQLClient(journeyPlannerV3Url);

const clientName = 'raskrute';
const entur = createEnturClient({
    clientName: clientName,
});

export const journeyQuery = gql`
query ($id: String!) {
    serviceJourney (id: $id) {
        id
        publicCode
        line {
            id
            name
            publicCode
            transportMode
            operator {
                id
                name
            }
            presentation {
                colour
                textColour
            }
        }
        passingTimes {
            departure {
                time
                dayOffset
            }
            arrival {
                time
                dayOffset
            }
            timingPoint
            quay {
                id
                name
                latitude
                longitude
                publicCode
                stopPlace {
                    id
                    name
                }
                situations {
                    id
                    infoLinks {
                        label
                    }
                    advice {
                        value
                        language
                    }
                    summary {
                        value
                        language
                    }
                    severity
                    description {
                        value
                        language
                    }
                }
            }
        }
        quays {
            id
            name
            description
        }
    }
}`

const FindJourney = (req: Request, res: Response) => {
    let VehicleJourneyName = req.params['VehicleJourneyName'];
    if (!VehicleJourneyName || !VehicleJourneyName.length || VehicleJourneyName.length < 1) {
        res.status(400).json({ error: 'bad param VehicleJourneyName' });
        return;
    }

    client.request(journeyQuery, { id: VehicleJourneyName })
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


const stopPlaceQuery = gql`
query ($id: String!) {
    stopPlace (id: $id) {
        id
        name
        latitude
        longitude
        transportMode
        estimatedCalls (numberOfDepartures: 100, numberOfDeparturesPerLineAndDestinationDisplay: 5, timeRange: 86400) {
            realtime
            realtimeState
            cancellation
            aimedDepartureTime
            expectedDepartureTime
            destinationDisplay {
                frontText
            }
            notices {
                id
                text
                publicCode
            }
            situations {
                id
                infoLinks {
                    label
                }
                advice {
                    value
                    language
                }
                summary {
                    value
                    language
                }
                severity
                description {
                    value
                    language
                }
            }
            quay {
                id
                name
                latitude
                longitude
            }
            serviceJourney {
                id
                line {
                    publicCode
                    name
                    transportMode
                    transportSubmode
                    operator {
                        id
                        name
                    }
                    presentation {
                        colour
                        textColour
                    }
                    situations {
                        id
                        severity
                        reportType
                        advice {
                            value
                            language
                        }
                        summary {
                            value
                            language
                        }
                        description {
                            value
                            language
                        }
                        infoLinks {
                            uri
                            label
                        }
                    }
                    notices {
                        id
                        text
                        publicCode
                    }
                }
            }
        }
        quays {
            id
            name
            latitude
            longitude
            lines {
                transportMode
            }
        }
    }
}`

api.get('/routes/:stopId', (req, res) => {
    const stopId = req.params.stopId || '';
    if (!stopId || !stopId.length || stopId.length < 1) {
        res.status(400).json({ error: 'bad param stopId' });
        return;
    }

    console.log('stopPlaceQueryString', stopPlaceQuery)
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

    client.request(stopPlaceQuery, { id: stopId })
        .then((result: any) => result.data || result)
        .then(remapToRuter)
        .then((data: any) => res.json(data))
        .catch((err: any) => {
            log(`error get stopid=${stopId}`, err);
            res.status(500);
        });
});

// eg. https://reisapi.ruter.no/Place/GetClosestStops?coordinates=(x=600268,y=6644331)
// coordinates in UTM32 format.
// See: https://reisapi.ruter.no/Help/Api/GET-Place-GetClosestStops_coordinates_proposals_maxdistance
const API_CLOSEST_URL = '/Place/GetClosestStops?coordinates=(x=${X},y=${Y})';

function placeByPositionToRuterStop(stop: StopPlace, location: { latitude: number, longitude: number }) {
    let utm = latLonToUTM(stop.latitude!, stop.longitude!);
    const coords: Coords = {
        latitude: stop.latitude!,
        longitude: stop.longitude!,
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

export const getStopPlacesByBboxQuery = gql`
query(
    $minLat: Float!,
    $minLng: Float!,
    $maxLng: Float!,
    $maxLat: Float!,
) {
    stopPlacesByBbox(
        minimumLatitude: $minLat,
        minimumLongitude: $minLng,
        maximumLatitude: $maxLat,
        maximumLongitude: $maxLng
    ) {
        id
        name
        description
        latitude
        longitude
        transportMode
        transportSubmode
    }
}
`
const distance_meters = 500;

api.post('/closest', (req, res) => {
    const { X, Y } = req.body;
    if (!X || !Y) {
        res.status(400).json({ error: `X or Y param is not valid. Got: X=${X} Y=${Y}` });
        return;
    }

    const coords = utmToLatLong(Y, X);

    log('coords=', coords);

    const bbox = convertPositionToBbox(coords, distance_meters);

    return client.request(getStopPlacesByBboxQuery, bbox)
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
            log('Error with getStopPlacesByBboxQuery', err);
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

export interface Bbox {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number
}

export interface Coordinates {
    latitude: number
    longitude: number
}

export function convertPositionToBbox(
    coordinates: Coordinates,
    distance: number,
): Bbox {
    const { latitude, longitude } = coordinates;
    const distanceToKilometer = distance / 1000;

    const position = point([longitude, latitude])

    const east = destination(position, distanceToKilometer, 0)
    const north = destination(position, distanceToKilometer, 90)
    const west = destination(position, distanceToKilometer, 180)
    const south = destination(position, distanceToKilometer, -90)

    const line = lineString([
        east.geometry.coordinates,
        north.geometry.coordinates,
        west.geometry.coordinates,
        south.geometry.coordinates,
    ])

    const [minLng, minLat, maxLng, maxLat] = bbox(line)

    return {
        minLng,
        minLat,
        maxLng,
        maxLat,
    }
}
