import { StoreonModule, StoreonStore } from 'storeon'
import { Position, Rute } from '../api/types'
import { fetchClosest } from "../action/api";
import { latLonToUTM } from "../util/ruteutils";

// State structure
export interface LocationState {
    error: boolean | string;
    loading: boolean;
    closest?: Array<Rute>;
    position?: Position
}

export interface LocationStateRoot {
    location: LocationState
}

// Events declaration: map of event names to type of event data
export interface LocationEvents {
    'location/getClosest': Position | undefined;
    'location/setClosest': Array<Rute> | undefined;
    'location/setError': boolean | string;
    'location/setLoading': boolean;
    'location/setLocation': Position;
    'location/enableLocation': void;
}

export const locationModule: StoreonModule<LocationStateRoot, LocationEvents> = store => {
    store.on('@init', () => ({ location: { loading: false, error: false } }));

    store.on('location/setError', (state, error) => ({
            location: {
                ...state.location,
                loading: false,
                error: error,
            }
        })
    );

    store.on('location/setLoading', (state, next) => ({
        location: {
            ...state.location,
            loading: next,
            error: false,
        }
    }));

    store.on('location/setClosest', (state, next) => ({
        location: {
            ...state.location,
            closest: next,
        }
    }));

    store.on('location/setLocation', (state, pos) => {
        return {
            location: {
                ...state.location,
                loading: false,
                error: false,
                position: pos,
            },
        };
    });

    store.on('location/getClosest', async (state, pos) => {
        store.dispatch('location/setLoading', true);
        pos = pos || state.location.position;
        if (!pos) {
            pos = await startGeoLocation(window.navigator, store);
        }
        const { X, Y } = latLonToUTM(pos.latitude, pos.longitude);
        const res = await fetchClosest(X, Y);
        store.dispatch('location/setLoading', false);
        store.dispatch('location/setClosest', res);
    });

    store.on('location/enableLocation', async (state, arg): Promise<void> => {
        store.dispatch('location/setLoading', true);
        const res = await startGeoLocation(window.navigator, store);
        store.dispatch('location/setLoading', false);
    })
};

export interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * startGeoLocation sets up an initial location for phone, and starts a watch.
 * Also sets up an error if location is not available.
 */
const startGeoLocation = (navigator: Navigator, store: StoreonStore<LocationStateRoot, LocationEvents>): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            let resolveCounter = 0;
            let hasResolved = false;
            navigator.geolocation.watchPosition(
                pos => {
                    resolveCounter = resolveCounter + 1;
                    store.dispatch('location/setLocation', pos.coords);
                    console.log('setPosition: resolveCounter', resolveCounter, pos);

                    if (!hasResolved) {
                        hasResolved = true;
                        resolve(pos.coords);
                    }
                },
                err => {
                    resolveCounter = resolveCounter + 1;
                    store.dispatch('location/setError', `${ err.code }: ${ err.message }`);
                    console.log('err: resolveCounter', resolveCounter, err);

                    if (!hasResolved) {
                        hasResolved = true;
                        reject(err);
                    }
                },
                { enableHighAccuracy: true }
            );
        } else {
            // TODO: do something, we dont have geolocation in this browser
            store.dispatch('location/setError', 'No geolocation available in browser.');
            reject(new Error('No geolocation available in browser.'));
        }
    })
};
