import createStore from "storeon";
import { MapEvents, mapModule, MapStateRoot } from "./mapstore";
import { SearchEvents, searchModule, SearchStateRoot } from "./searchstore";
import { LocationEvents, locationModule, LocationStateRoot } from "./location";

export * from './reducers'
export * from './store'

export type AppState = MapStateRoot & SearchStateRoot & LocationStateRoot
export type AppEvents = MapEvents & SearchEvents & LocationEvents

export const storeOnStore = createStore<AppState, AppEvents>([
    mapModule,
    searchModule,
    locationModule,
    process.env.NODE_ENV !== 'production' && require('storeon/devtools'),
]);

let newVar = storeOnStore.get();
