import { StoreonModule } from 'storeon'
import { FavorittStoreSchema, FavorittStoreType, StopPlace } from "./favoritter";

export interface FavoritterStoreRootState {
    favorites: FavorittStoreType
}

export type FavoriteStopType = StopPlace

export interface UpdateFavoriteAction {
    stop: FavoriteStopType
    isFavorited: boolean
}

// Events declaration: map of event names to type of event data
export interface FavoritesEvents {
    'favorites/update': UpdateFavoriteAction;
    'favorites/load': boolean;
}

function saveFavoritesSilent(faves: FavorittStoreType): FavorittStoreType {
    try {
        faves['last_saved'] = new Date();
        let json = JSON.stringify(faves);
        localStorage.setItem('FAVORITTER', json);
    } catch (e) {
        console.log('Error storing FAVORITTER: ', e);
    }
    return faves;
}

export const favoritesModule: StoreonModule<FavoritterStoreRootState, FavoritesEvents> = store => {
    store.on('@init', (state) => {
        store.dispatch('favorites/load', true)
        return {}
    });

    store.on('favorites/load', (state, action) => {
        try {
            let data = localStorage.getItem('FAVORITTER');
            data = data || '{}';
            const json = JSON.parse(data);
            if (!json.hasOwnProperty('last_saved')) {
                json['last_saved'] = new Date().toISOString();
            }

            let parsed = FavorittStoreSchema.parse(json);
            return {
                ...state,
                favorites: parsed,
            }
        } catch (err) {
            console.log('error loading FAVORITTER!', err);
            // wipe FAVORITTER as its not going to parse anyway:
            try {
                localStorage.removeItem('FAVORITTER');
            } catch (err) {
            }
            return {
                ...state,
                favorites: { last_saved: new Date().toISOString(), } as FavorittStoreType,
            }
        }

    })

    store.on('favorites/update', (state, action) => {
        if (action.isFavorited) {
            const faves = {
                ...state.favorites,
                stops: {
                    ...state.favorites.stops,
                    [action.stop.ID]: action.stop,
                },
            };
            return {
                ...state,
                favorites: saveFavoritesSilent(faves),
            }
        } else {
            const faves = {
                ...state.favorites,
                stops: { ...state.favorites.stops },
            }
            delete faves.stops[action.stop.ID];
            return {
                ...state,
                favorites: saveFavoritesSilent(faves),
            }
        }
    })
}
