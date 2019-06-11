import { all, fork, takeEvery, takeLatest, put, select, call } from 'redux-saga/effects'

import {
  ActionTypes,
  ruteSearchRequest,
  trackLocation,
  ruteSearchFailed,
  ruteSearchSuccess,
  getClosestFailed,
  getClosestSuccess
} from './actions';
import { position, location } from './selectors';
import { latLonToUTM } from '../util/ruteutils';
import { fetchClosest } from './api';

function userPositionPromised() {
  const position = {};
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      location => position.on({ location }),
      error => position.on({ error }),
      { enableHighAccuracy: true }
    )
  }
  return { getLocation: () => new Promise(location => position.on = location) }
}

function* getUserLocation() {
  const { getLocation } = yield call(userPositionPromised);
  const { error, location } = yield call(getLocation);
  if (error) {
    console.log('Failed to get user position!', error)
  } else {
    console.log('Received User Location', location)
  }
}

export function* getGeoLocation(action) {
  console.log('getGeoLocation', action);
}

export function* watchGeoLocationRequest() {
  yield takeLatest(ActionTypes.TRACK_LOCATION_REQUEST, getGeoLocation);
}

export function* getClosestStops(action) {

  console.log('getClosestStops', action);

  yield put(ruteSearchRequest(''));

  yield put(trackLocation());

  const { latitude, longitude } = yield select(location);

  if (latitude && longitude) {
    const { X, Y } = latLonToUTM(latitude, longitude);
    const { result, error }  = yield call(fetchClosest, X, Y);
    if (error) {
      yield put(getClosestFailed(error));
      yield put(ruteSearchFailed(error));
    } else {
      yield put(getClosestSuccess(result));
      yield put(ruteSearchSuccess(result));
    }

  } else {
    yield put(getClosestFailed('Posisjon er ikke slått på.'));
    yield put(ruteSearchFailed('Posisjon er ikke slått på.'));
  }

}

function* watchGetClosestRequest() {
  yield takeEvery(ActionTypes.GET_CLOSEST_REQUEST, getClosestStops);
}

export default function* rootSaga() {
  yield all ([
    fork(watchGetClosestRequest),
    fork(watchGeoLocationRequest),
  ]);
};
