import { StoreonModule } from 'storeon'
import { Position } from '../api/types'

// State structure
export interface MapState {
    open: boolean;
    coords?: Position
}

export interface MapStateRoot {
    map: MapState
}

// Events declaration: map of event names to type of event data
export interface MapEvents {
    'map/setOpen': boolean;
    'map/setLocation': Position;
}

export const mapModule: StoreonModule<MapStateRoot, MapEvents> = store => {
    store.on('@init', () => ({ map: { open: false }}));
    store.on('map/setOpen', (state, isOpen) => ({ map: { ...state.map, open: isOpen }}));
    store.on('map/setLocation', (state, coords) => {
        return { map: { ...state.map, coords: coords }};
    });
}
