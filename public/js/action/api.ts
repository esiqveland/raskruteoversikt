import { Rute, RuteType } from "../api/types";

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
