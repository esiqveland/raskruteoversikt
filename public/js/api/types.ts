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
