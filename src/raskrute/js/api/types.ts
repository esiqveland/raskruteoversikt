import * as z from "zod";
import moment from "moment/moment";
import getLineColor from "./linecolours";
import { utmToLatLong } from "../util/ruteutils";
import Moment from "moment";

export enum RuteType {
    STREET = 'Street',
    STOP = 'Stop',
    AREA = 'Area',
    POI = 'POI',
}

export interface Rute {
    id: string;
    name: string;
    distance?: number;
    District?: string;
    PlaceType: RuteType;
}

export interface Position {
    latitude: number;
    longitude: number;
}

const DeviationSchema = z.object({
    id: z.string(),
    summary: z.object({ no: z.string().optional(), en: z.string().optional() }).optional(),
    advice: z.object({ no: z.string().optional(), en: z.string().optional() }).optional(),
    description: z.object({ no: z.string().optional(), en: z.string().optional() }).optional()
});
export type DeviationSchemaType = z.infer<typeof DeviationSchema>;
z.object({
    realtime: z.boolean(),
    realtimeState: z.string(),
    aimedDepartureTime: z.string().transform(toMoment),
    expectedDepartureTime: z.string().transform(toMoment),
    destinationDisplay: z.object({ frontText: z.string() }),
    quay: z.object({
        id: z.string(),
        name: z.string(),
        latitude: z.number(),
        longitude: z.number()
    }),
    serviceJourney: z.object({
        id: z.string(),
        line: z.object({
            publicCode: z.string(),
            name: z.string(),
            transportMode: z.string(),
            transportSubmode: z.string().optional(),
            situations: z.array(z.unknown()),
            notices: z.array(z.unknown()),
            operator: z.object({
                id: z.string(),
                name: z.string(),
            }),
            presentation: z.object({
                colour: z.string(),
                textColour: z.string(),
            }).optional(),
        })
    }),
    Extensions: z.object({
        Deviations: z.array(DeviationSchema),
        //Notices: z.array(z.unknown()),
    }),
    MonitoredVehicleJourney: z.object({
        DestinationName: z.string(),
        PublishedLineName: z.string(),
        LineRef: z.string(),
        Monitored: z.boolean().optional(),
        MonitoredCall: z.object({
            DeparturePlatformName: z.string().optional(),
            ExpectedArrivalTime: z.string().optional(),
            AimedArrivalTime: z.string().datetime().optional(),
            AimedDepartureTime: z.string().optional(),
            ExpectedDepartureTime: z.string().optional(),
            DestinationDisplay: z.string().optional(),
            VehicleAtStop: z.boolean().optional(),
        }),
        VehicleJourneyName: z.string()
    }),
    // RecordedAtTime: z.string().datetime(),
    MonitoringRef: z.string()
}).transform(avgang => {
    let isDelayed = false;
    const AimedDepartureTime = moment(avgang.MonitoredVehicleJourney.MonitoredCall.AimedDepartureTime);
    const ExpectedDepartureTime = moment(avgang.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime);
    if (avgang.MonitoredVehicleJourney.MonitoredCall.AimedDepartureTime && avgang.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime) {
        isDelayed = AimedDepartureTime.isBefore(ExpectedDepartureTime, 'minute');
    }
    let lineColour = getLineColor({
        transportMode: avgang.serviceJourney.line.transportMode,
        transportSubmode: avgang.serviceJourney.line.transportSubmode || '',
        publicCode: avgang.serviceJourney.line.publicCode,
        operatorId: avgang.serviceJourney.line.operator.id,
    });

    const ID = '' + avgang.MonitoringRef + avgang.MonitoredVehicleJourney.LineRef + lineColour + AimedDepartureTime.unix() + ExpectedDepartureTime.unix();
    if (avgang.serviceJourney.line.presentation) {
        const colour = avgang.serviceJourney.line.presentation.colour || '';
        if (colour) {
            lineColour = '#' + colour;
        }
    }
    return {
        ...avgang,
        ID: ID,
        isDelayed: isDelayed,
        LineColour: lineColour,
    }
});
function toMoment(arg: string | Date) {
    return moment(arg);
}

export const TransportModeSchema = z.union([
    z.enum([ 'unknown', 'water', 'boat', 'ferry', 'metro', 'bus', 'train', 'rail', 'tram', 'coach', 'all', ]),
    z.string(),
]);
export type TransportModeType = z.infer<typeof TransportModeSchema>;

export interface GeoLocation {
    latitude: number
    longitude: number
}

export const TranslatedStringsSchema = z.object({
    value: z.string(),
    language: z.string().default('no'),
});

const SituationSchema = z.object({
    id: z.string(),
    summary: z.array(TranslatedStringsSchema),
    description: z.array(TranslatedStringsSchema),
    advice: z.array(TranslatedStringsSchema),
    creationTime: z.string().transform(toMoment).optional(),
    infoLinks: z.array(z.object({
        url: z.string().optional(),
        label: z.string().default(''),
    })).optional(),
});

export type SituationSchemaType = z.infer<typeof SituationSchema>

const RealTimeStateSchema = z.string();

const EstimatedCallSchema = z.object({
    // Whether this call has been updated with real time information.
    realtime: z.boolean(),
    realtimeState: RealTimeStateSchema,
    // Whether stop is cancelled. This means that either the ServiceJourney has a planned cancellation,
    // the ServiceJourney has been cancelled by real-time data, or this particular StopPoint has been cancelled.
    // This also means that both boarding and alighting has been cancelled.
    cancellation: z.boolean(),
    aimedDepartureTime: z.string().transform(toMoment),
    expectedDepartureTime: z.string().transform(toMoment),
    destinationDisplay: z.object({ frontText: z.string() }),
    situations: z.array(SituationSchema),
    notices: z.array(z.object({
        id: z.string(),
        text: z.string().optional(),
        publicCode: z.string().optional()
    })),
    quay: z.object({
        id: z.string(),
        name: z.string(),
        latitude: z.number(),
        longitude: z.number()
    }),
    serviceJourney: z.object({
        id: z.string(),
        line: z.object({
            publicCode: z.string(),
            name: z.string(),
            transportMode: z.string(),
            transportSubmode: z.string().optional(),
            operator: z.object({
                id: z.string(),
                name: z.string(),
            }),
            presentation: z.object({
                colour: z.string(),
                textColour: z.string(),
            }).optional(),
        })
    }),
}).transform(estimatedCall => {
    const AimedDepartureTime = estimatedCall.aimedDepartureTime;
    const ExpectedDepartureTime = estimatedCall.expectedDepartureTime;
    const isDelayed = AimedDepartureTime.isBefore(ExpectedDepartureTime, 'minute');

    return {
        ...estimatedCall,
        Deviations: (estimatedCall.situations || []).map(toDeviations),
        isDelayed: isDelayed,
    }
});
export type EstimatedCallSchemaType = z.infer<typeof EstimatedCallSchema>;

function toDeviations(sit: SituationSchemaType): DeviationSchemaType {
    const summary = sit.summary
        .reduce((a: any, b: any) => {
            // sometimes language is not set from Entur API.
            // default it to 'no'
            a[b.language || 'no'] = b.value;
            return a;
        }, {});
    const advice = sit.advice
        .reduce((a: any, b: any) => {
            a[b.language || 'no'] = b.value;
            return a;
        }, {});

    const description = sit.description
        .reduce((a: any, b: any) => {
            a[b.language || 'no'] = b.value;
            return a;
        }, {});

    return {
        id: sit.id,
        summary: summary,
        advice: advice,
        description: description,
    };
}

export const RouteShapeSchema = z.object({
    id: z.string(),
    // ID: z.string(),
    name: z.string(),
    // Name: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    X: z.number().optional(),
    Y: z.number().optional(),
    transportMode: TransportModeSchema,
    PlaceType: z.string(),
    modes: z.array(TransportModeSchema),
    // estimatedCalls must replace avganger
    // avganger is the RuterAPI version of the data.
    estimatedCalls: z.array(EstimatedCallSchema),
    //avganger: z.array(RouteAvgangSchema),
}).transform(rute => {
    const { latitude, longitude, X, Y } = rute;
    let location: GeoLocation | undefined = undefined
    if (latitude && longitude) {
        location = {
            latitude,
            longitude,
        }
        return {
            ...rute,
            location: location,
        }
    }
    if (X && Y) {
        return {
            ...rute,
            location: utmToLatLong(Y, X),
        };
    } else {
        return {
            ...rute,
            location: undefined,
        }
    }
})
export type RouteSchemaType = z.infer<typeof RouteShapeSchema>;

const sample = {
    "ID": "NSR:StopPlace:61268",
    "id": "NSR:StopPlace:61268",
    "name": "Sinsen T",
    "latitude": 59.936978,
    "longitude": 10.781837,
    "transportMode": "unknown",
    "Name": "Sinsen T",
    "PlaceType": "Stop",
    "modes": [
        "bus",
        "metro"
    ]
}

export interface Stop {
    Name: string
    ArrivalTime: moment.Moment
    DepartureTime: moment.Moment
}

export const QuaySchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    publicCode: z.string().optional(),
    stopPlace: z.object({
        id: z.string(),
        name: z.string(),
    }).optional(),
    situations: z.array(z.object({})).optional(),
});
export type QuaySchemaType = z.infer<typeof QuaySchema>;

export const JourneyPassingTimeSchema = z.object({
    timingPoint: z.boolean().optional(),
    departure: z.object({
        time: z.string().time(),
        dayOffset: z.number(),
    }),
    arrival: z.object({
        time: z.string().time(),
        dayOffset: z.number(),
    }),
    quay: QuaySchema,
}).transform(passingTime => {
        const now = moment();
        // const now = moment.utc().tz('Europe/Oslo');

        let departureTime: Moment.Moment | null = null;
        if (passingTime.departure) {
            const dayOffset = passingTime.departure.dayOffset;
            const dayTime = passingTime.departure.time;
            const [ dayHour, dayMinute, daySecond ] = dayTime.split(':');
            departureTime = now
                .add(dayOffset, 'day')
                .set('hour', parseInt(dayHour))
                .set('minute', parseInt(dayMinute))
                .set('second', parseInt(daySecond));
        }

        let arrivalTime: Moment.Moment | null = null;
        if (passingTime.arrival) {
            const dayArrivalOffset = passingTime.arrival.dayOffset;
            const dayArrivalTime = passingTime.arrival.time;
            const [ dayArrivalHour, dayArrivalMinute, dayArrivalSecond ] = dayArrivalTime.split(':');

            arrivalTime = now
                .add(dayArrivalOffset, 'day')
                .set('hour', parseInt(dayArrivalHour))
                .set('minute', parseInt(dayArrivalMinute))
                .set('second', parseInt(dayArrivalSecond));
        }

        return {
            ...passingTime,
            ArrivalTime: arrivalTime,
            DepartureTime: departureTime,
        }
});

export type JourneyPassingTimeType = z.infer<typeof JourneyPassingTimeSchema>;

export const JourneySchema = z.object({
    "line": z.object({
        id: z.string(),
        name: z.string().optional(),
        publicCode: z.string().optional(),
        transportMode: TransportModeSchema,
        transportSubmode: z.string().optional(),
        operator: z.object({
            id: z.string(),
            name: z.string(),
        }),
        presentation: z.object({
            colour: z.string(),
            textColour: z.string(),
        }).optional(),
    }),
    "quays": z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
    })),
    "passingTimes": z.array(JourneyPassingTimeSchema),
    // "Stops": z.array(JourneyStopSchema),
}).transform(arg => {
    let lineColour = getLineColor({
        transportMode: arg.line.transportMode,
        transportSubmode: arg.line.transportSubmode || '',
        publicCode: arg.line.publicCode,
        operatorId: arg.line.operator.id,
    });
    if (arg.line.presentation) {
        const colour = arg.line.presentation.colour || '';
        if (colour) {
            lineColour = '#' + colour;
        }
    }

    return {
        ...arg,
        LineColour: lineColour,
    }
})
export type JourneySchemaType = z.infer<typeof JourneySchema>;


