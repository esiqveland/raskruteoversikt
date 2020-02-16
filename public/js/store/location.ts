import createStore, { Module } from 'storeon'
import { Position } from '../api/types'
import { location as selectLocation, position as selectPosition } from "../action/selectors";
import { setPosition, setPositionError, trackLocationRequest } from "../action/actions";

// State structure
export interface LocationState {
    error: boolean | string;
    loading: boolean;
    position?: Position
}

export interface LocationStateRoot {
    location: LocationState
}

// Events declaration: map of event names to type of event data
export interface LocationEvents {
    'location/setError': boolean | string;
    'location/setLoading': boolean;
    'location/setLocation': Position;
    'location/enableLocation': void;
}

export const locationModule: Module<LocationStateRoot, LocationEvents> = store => {
    store.on('@init', () => ({ location: { loading: false, error: false } }));
    store.on('location/setError', (state, error) => ({ location: { loading: false, error: error } }));
    store.on('location/setLoading', (state, next) => ({ location: { loading: next, error: false } }));
    store.on('location/setLocation', (state, pos) => {
        return {
            location: {
                loading: false,
                error: false,
                position: pos,
            },
        };
    });
    store.on('location/enableLocation', async (state, arg): Promise<void> => {
        store.dispatch('location/setLoading', true);
        startGeoLocation(window.navigator, store);
    })
};

// function trackLocation() {
//     return (dispatch, getState) => {
//         try {
//             const state = getState();
//             const { isWatching } = selectPosition(state);
//             if (!isWatching) {
//                 dispatch(trackLocationRequest());
//                 return new Promise((resolve, reject) => {
//                     startGeoLocation(resolve);
//                 });
//             } else {
//                 const { latitude, longitude } = selectLocation(state);
//                 return Promise.resolve({ result: {} });
//             }
//         } catch (err) {
//             console.log('error with geolocation: ', err);
//             return Promise.reject(err);
//         }
//     }
// }

/**
 * startGeoLocation sets up an initial location for phone, and starts a watch.
 * Also sets up an error if location is not available.
 */
const startGeoLocation = (navigator: Navigator, store: createStore.Store<LocationStateRoot, LocationEvents>) => {
    if (navigator.geolocation) {
        // navigator.geolocation.getCurrentPosition(loc => {
        //   dispatch(setPosition(loc));
        // }, err => {
        //   dispatch(setPositionError(err.code, err.message));
        // });

        let resolveCounter = 0;
        navigator.geolocation.watchPosition(
            pos => {
                resolveCounter = resolveCounter + 1;
                store.dispatch('location/setLocation', pos.coords);
                console.log('setPosition: resolveCounter', resolveCounter, pos);
            },
            err => {
                resolveCounter = resolveCounter + 1;
                store.dispatch('location/setError', `${ err.code }: ${ err.message }`);
                console.log('err: resolveCounter', resolveCounter, err);
            },
            { enableHighAccuracy: true }
        );
    } else {
        // TODO: do something, we dont have geolocation in this browser
        store.dispatch('location/setError', 'No geolocation available in browser.');
    }
};
