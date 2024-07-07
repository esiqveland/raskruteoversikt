import {
    JourneyPassingTimeType,
    JourneySchema,
    JourneySchemaType,
    RouteSchemaType,
    RouteShapeSchema,
    Rute,
    RuteType
} from "../api/types";
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


export type ApiRute = RouteSchemaType

export function getRouteId(routeId: string) {
    return fetch(`/api/v2/routes/${ routeId }`)
        .then(checkStatus)
        .then((response) => response.json())
        .then((jsonData: any) => {
            return RouteShapeSchema.parse(jsonData);
        })
}

// helper that tests parsing on load:
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

export type JourneySchemaTypeWithDiff = JourneySchemaType & JourneyDiff
export type JourneySchemaStopWithDiff = JourneyPassingTimeType & JourneyStopDiff
export interface JourneyDiff {
    Stops: Array<JourneySchemaStopWithDiff>;
}

export function calculateDepartureDiffs(journey: JourneySchemaType): JourneySchemaTypeWithDiff {
    let prev: JourneyPassingTimeType | undefined = undefined;
    let elapsed = 0;

    const stops = journey.passingTimes.map((passingTime): JourneySchemaStopWithDiff => {
        const depTime = passingTime.DepartureTime?.format('HH:mm');
        let diffTime = undefined;
        if (prev) {
            diffTime = moment.duration(passingTime.DepartureTime?.diff(prev.DepartureTime)).minutes();
            elapsed += diffTime;
        }
        let duration = '';
        diffTime ? duration = ` (${ elapsed } min)` : duration = '';
        let durationShort = '';
        diffTime ? durationShort = `+ ${ diffTime } min` : duration = '';

        prev = passingTime;

        return {
            ...passingTime,
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
