import { createStoreon } from 'storeon';
import { storeonLogger } from 'storeon/devtools';
import { MapEvents, mapModule, MapStateRoot } from "./mapstore";
import { SearchEvents, searchModule, SearchStateRoot } from "./searchstore";
import { LocationEvents, locationModule, LocationStateRoot } from "./location";
import { useStoreon } from "storeon/react";
import { FavoritesEvents, favoritesModule, FavoritterStoreRootState } from "./favoritter/favorittModule";

// export * from './reducers'
export * from './store'

export function useRuteStore(
    ...keys: (keyof AppState)[]
) {
    return useStoreon<AppState, AppEvents>(...keys);
}

export type AppState = MapStateRoot & SearchStateRoot & LocationStateRoot & FavoritterStoreRootState
export type AppEvents = MapEvents & SearchEvents & LocationEvents & FavoritesEvents

export const storeOnStore = createStoreon<AppState, AppEvents>([
    mapModule,
    searchModule,
    locationModule,
    favoritesModule,
    storeonLogger,
]);

let newVar = storeOnStore.get();
