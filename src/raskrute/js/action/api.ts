import {
    JourneySchema,
    JourneySchemaType,
    JourneyStopSchemaType,
    RouteAvgangType,
    RouteSchemaType,
    RouteShapeSchema,
    Rute,
    RuteType
} from "../api/types";
import { utmToLatLong } from "../util/ruteutils";
import { GeoLocation } from "../components/ViewRoute";
import moment from "moment/moment";

const jsonHeaders = (oldHeaders: {}) => ({
    ...oldHeaders,
    Accept: 'application/json',
    'Content-Type': 'application/json',
});

function checkStatus(response: Response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        const err = new Error('Status: ' + response.status);
        (err as any).response = response;
        throw err;
    }
}

export function toJson<T>(response: Response) {
    return response.json() as Promise<T>;
}

export const fetchClosest = (X: number, Y: number) =>
    postJson(`/api/v2/closest`, { X: X, Y: Y }, {})
        .then(r => toJson<Array<Rute>>(r))
        .then(data => data.filter(result => result.PlaceType === RuteType.STOP));

export const postJson = (url: string, body: {}, headers: {}) =>
    fetch(url, {
        method: 'POST',
        headers: jsonHeaders(headers),
        body: JSON.stringify(body),
    }).then(checkStatus)


type ApiRute = RouteSchemaType

const removeNotMonitored = (avganger: Array<RouteAvgangType>) => {
    return avganger
    // return avganger.filter(avgang => avgang.MonitoredVehicleJourney.Monitored === true);
};

export interface RuteLocation {
    location?: GeoLocation;
}

export type ApiRuteWithLocation = LegacyRuteType & RuteLocation
export const convertLocation = (rute: LegacyRuteType): ApiRuteWithLocation => {
    const { latitude, longitude, X, Y } = rute;
    if (latitude && longitude) {
        return {
            ...rute,
            location: {
                latitude,
                longitude,
            }
        }
    }

    if (X && Y) {
        return {
            ...rute,
            location: utmToLatLong(Y, X),
        };
    } else {
        return rute
    }
};

export interface RouteAvgangLegacyType {
    ID: string,
    isDelayed: boolean,
    LineColour: string,
    DestinationName: string,
    LineRef: string,
    VehicleJourneyName: string,
    PublishedLineName: string,
    VehicleAtStop: boolean,
    DestinationDisplay: string,
    DeparturePlatformName: string,
    MonitoringRef: string
    AimedArrivalTime: moment.Moment,
    AimedDepartureTime: moment.Moment,
    ExpectedDepartureTime: moment.Moment,
    ExpectedArrivalTime: moment.Moment,
}

export type RouteAvgangTypeCompatibility = RouteAvgangType & RouteAvgangLegacyType
export const transformAvgangToOldFormat = (avgang: RouteAvgangType): RouteAvgangTypeCompatibility => {
    let isDelayed = false;
    const AimedDepartureTime = moment(avgang.MonitoredVehicleJourney.MonitoredCall.AimedDepartureTime);
    const ExpectedDepartureTime = moment(avgang.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime);
    if (avgang.MonitoredVehicleJourney.MonitoredCall.AimedDepartureTime && avgang.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime) {
        isDelayed = AimedDepartureTime.isBefore(ExpectedDepartureTime, 'minute');
    }
    const ID = '' + avgang.MonitoringRef + avgang.MonitoredVehicleJourney.LineRef + avgang.Extensions.LineColour + AimedDepartureTime.unix() + ExpectedDepartureTime.unix();

    return {
        ...avgang,
        ID: ID,
        isDelayed: isDelayed,
        Extensions: avgang.Extensions,
        LineColour: avgang.Extensions.LineColour,
        DestinationName: avgang.MonitoredVehicleJourney.DestinationName,
        LineRef: avgang.MonitoredVehicleJourney.LineRef,
        VehicleJourneyName: avgang.MonitoredVehicleJourney.VehicleJourneyName,
        PublishedLineName: avgang.MonitoredVehicleJourney.PublishedLineName,
        VehicleAtStop: avgang.MonitoredVehicleJourney.MonitoredCall.VehicleAtStop || false,
        AimedArrivalTime: moment(avgang.MonitoredVehicleJourney.MonitoredCall.AimedArrivalTime),
        AimedDepartureTime: moment(avgang.MonitoredVehicleJourney.MonitoredCall.AimedDepartureTime),
        ExpectedDepartureTime: moment(avgang.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime),
        ExpectedArrivalTime: moment(avgang.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime),
        DestinationDisplay: avgang.MonitoredVehicleJourney.MonitoredCall.DestinationDisplay || '',
        DeparturePlatformName: avgang.MonitoredVehicleJourney.MonitoredCall.DeparturePlatformName || '',
        MonitoringRef: avgang.MonitoringRef
    };
};

export interface ApiRuteLegacyCompat {
    avganger: Array<RouteAvgangTypeCompatibility>
}

export type LegacyRuteType = ApiRute & ApiRuteLegacyCompat;

function toLegacyRute(rute: ApiRute): LegacyRuteType {
    return {
        ...rute,
        avganger: rute.avganger.map(transformAvgangToOldFormat),
    }
}

export function getRouteId(routeId: string) {
    return fetch(`/api/v2/routes/${ routeId }`)
        .then(checkStatus)
        .then((response) => response.json())
        .then((jsonData: any) => {
            return RouteShapeSchema.parse(jsonData);
        })
        .then(rute => toLegacyRute(rute))
        .then(rute => convertLocation(rute));
}

// getRouteId('NSR:StopPlace:61268')

export const JourneyDateTimePattern = 'DDMMYYYYHHmmss';

export function getJourneyRef(journeyRef: string, dateTime: Date | moment.Moment | string) {
    if (dateTime instanceof Date) {
        dateTime = moment(dateTime)
    }
    if (moment.isMoment(dateTime)) {
        dateTime = dateTime.format(JourneyDateTimePattern);
    }
    const URL = `/api/v2/journey/${ journeyRef }/${ dateTime }`;

    return fetch(URL)
        .then(res => res.json())
        .then(JourneySchema.parse)
        .then(jsondata => calculateDepartureDiffs(jsondata));
}

export interface JourneyStopDiff {
    duration: string;
    durationShort: string;
    diffTime: number | undefined;
    elapsed: number;
    depTime: string | undefined;
}

export interface JourneyDiff {
    Stops: Array<JourneySchemaStopWithDiff>;
}

export type JourneySchemaStopWithDiff = JourneyStopSchemaType & JourneyStopDiff
export type JourneySchemaTypeWithDiff = JourneySchemaType & JourneyDiff

export function calculateDepartureDiffs(journey: JourneySchemaType): JourneySchemaTypeWithDiff {
    let prev: JourneyStopSchemaType | undefined = undefined;
    let elapsed = 0;

    const stops = journey.Stops.map((stop): JourneySchemaStopWithDiff => {
        const depTime = stop.DepartureTime?.format('HH:mm');
        let diffTime = undefined;
        if (prev) {
            diffTime = moment.duration(stop.DepartureTime?.diff(prev.DepartureTime)).minutes();
            elapsed += diffTime;
        }
        let duration = '';
        diffTime ? duration = ` (${ elapsed } min)` : duration = '';
        let durationShort = '';
        diffTime ? durationShort = `+ ${ diffTime } min` : duration = '';

        prev = stop;

        return {
            ...stop,
            duration: duration,
            durationShort: durationShort,
            diffTime: diffTime,
            elapsed: elapsed,
            depTime: depTime,
        };
    })

    console.log('time diffed stops', stops)
    return {
        ...journey,
        Stops: stops,
    };
};
