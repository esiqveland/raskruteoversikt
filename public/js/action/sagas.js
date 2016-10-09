import { takeEvery, takeLatest } from 'redux-saga';
import { fork, put, select, call} from 'redux-saga/effects'

import { ActionTypes, ruteSearchSuccess, getClosestFailed, getClosestSuccess } from './actions';
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

export function* getGeoLocation() {

}
export function* watchGeoLocationRequest() {
  yield takeLatest(ActionTypes.TRACK_LOCATION_REQUEST, getGeoLocation);
}
export function* getClosestStops() {
  console.log('getClosestStops');

  const { latitude, longitude } = yield select(location);

  if (latitude && longitude) {
    const { X, Y } = latLonToUTM(latitude, longitude);
    const { result, error }  = yield call(fetchClosest, X, Y);
    if (error) {
      yield put(getClosestFailed(error));
    } else {
      yield put(getClosestSuccess(result));
      yield put(ruteSearchSuccess(result));
    }

  } else {
    yield put(getClosestFailed('Posisjon er ikke slått på.'))
  }

}
export function* watchGetClosestRequest() {
  console.log('watchGetClosestRequest');
  yield takeEvery(ActionTypes.GET_CLOSEST_REQUEST, getClosestStops);
}

export default function* rootSaga() {
  yield [
    watchGeoLocationRequest(),
    watchGetClosestRequest(),
  ]
};