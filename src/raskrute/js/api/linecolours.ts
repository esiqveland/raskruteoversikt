import { TransportModeType } from "./types";

function railColors(transportSubmode: string) {
    switch (transportSubmode) {
        case 'airportLinkRail': return '#fd4f00';
        case 'local': return '#003087';
        default: return '#003087';
    }
}

function tryParseInt(value: string): number | undefined {
    try {
        return parseInt(value);
    } catch (error) {
        return undefined;
    }
}

function busColors(transportMode: string, transportSubmode: string, publicCode?: string, operatorId?: string) {
    operatorId = operatorId || '';
    if (publicCode) {
        const lineNumber = tryParseInt(publicCode) || 0;
        if (operatorId.startsWith('RUT:') && lineNumber) {
            if (lineNumber >= 100) {
                return 'rgb(118, 163, 0)';
            } else {
                return '#e60000';
            }
        }
    }
    switch (transportSubmode) {
        case 'localBus': return '#e60000';
        case 'airportLinkBus': return '#949494';
        default:
            return '#e60000';
    }
}

function getLineColor(
    {
        transportMode,
        transportSubmode,
        operatorId,
        publicCode,
    } : {
        transportMode: TransportModeType;
        transportSubmode: string;
        publicCode?: string | undefined;
        operatorId?: string;
    }
) {
    switch (transportMode) {
        case 'tram': return '#0b91ef';
        case 'coach':
        case 'bus':
            return busColors(transportMode, transportSubmode, publicCode, operatorId);
        case 'metro': return '#ec700c';
        case 'rail': return railColors(transportSubmode);
        default: return '#949494';
    }
}

export default getLineColor;
