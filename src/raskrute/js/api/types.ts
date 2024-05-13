import * as z from "zod";
import moment from "moment/moment";
import getLineColor from "./linecolours";

export enum RuteType {
    STREET = 'Street',
    STOP = 'Stop',
    AREA = 'Area',
    POI = 'POI',
}

export interface Rute {
    ID: string;
    Name: string;
    distance?: number;
    District?: string;
    PlaceType: RuteType;
}

export interface Position {
    latitude: number;
    longitude: number;
}

export const RouteAvgangSchema = z.object({
    realtime: z.boolean(),
    realtimeState: z.string(),
    aimedDepartureTime: z.string(),
    expectedDepartureTime: z.string(),
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
            notices: z.array(z.unknown())
        })
    }),
    notices: z.array(z.unknown()),
    Extensions: z.object({
        Deviations: z.array(z.object({
                id: z.string(),
                summary: z.object({ no: z.string().optional(), en: z.string().optional() }).optional(),
                advice: z.object({ no: z.string().optional() }).optional(),
                description: z.object({ no: z.string().optional(), en: z.string().optional() }).optional()
            })
        ),
        Notices: z.array(z.unknown()),
        LineColour: z.string()
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
});
export type RouteAvgangType = z.infer<typeof RouteAvgangSchema>;

export const TransportModeSchema = z.enum([ 'unknown', 'water', 'boat', 'ferry', 'metro', 'bus', 'train', 'rail', 'tram', 'all' ]);
export type TransportModeType = z.infer<typeof TransportModeSchema>;

export const RouteShapeSchema = z.object({
    id: z.string(),
    ID: z.string(),
    name: z.string(),
    Name: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    X: z.number().optional(),
    Y: z.number().optional(),
    transportMode: TransportModeSchema,
    PlaceType: z.string(),
    modes: z.array(TransportModeSchema),
    avganger: z.array(RouteAvgangSchema),
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
export interface Journey {
    Stops: Stop[]
}

export const JourneyStopSchema = z.object({
    Name: z.string(),
    ArrivalTime: z.coerce.date().transform(arg => moment(arg)).optional(),
    DepartureTime: z.coerce.date().transform(arg => moment(arg)).optional(),
})
export type JourneyStopSchemaType = z.infer<typeof JourneyStopSchema>;

export const JourneySchema = z.object({
    "line": z.object({
        id: z.string(),
        name: z.string().optional(),
        publicCode: z.string().optional(),
        transportMode: TransportModeSchema,
        transportSubmode: z.string().optional(),
    }),
    "Stops": z.array(JourneyStopSchema),
}).transform(arg => {
    return {
        ...arg,
        LineColour: getLineColor({
            transportMode: arg.line.transportMode,
            transportSubmode: arg.line.transportSubmode || '',
        }),
    }
})
export type JourneySchemaType = z.infer<typeof JourneySchema>;


