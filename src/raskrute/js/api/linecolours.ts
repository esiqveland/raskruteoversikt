import { TransportModeType } from "./types";

function railColors(transportSubmode: string) {
    switch (transportSubmode) {
        case 'airportLinkRail': return '#fd4f00';
        case 'local': return '#003087';
        default: return '#003087';
    }
}

function busColors(transportSubmode: string) {
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
    } : {
        transportMode: TransportModeType;
        transportSubmode: string;
        operatorId?: string;
    }
) {
    switch (transportMode) {
        case 'tram': return '#0b91ef';
        case 'bus':
            return busColors(transportSubmode);
        case 'metro': return '#ec700c';
        case 'rail': return railColors(transportSubmode);
        default: return '#949494';
    }
}

export default getLineColor;
