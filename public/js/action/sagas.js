import { all, call, fork, takeLatest } from 'redux-saga/effects'

import { ActionTypes } from './actions';

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

export default function* rootSaga() {
  yield all ([
    fork(watchGeoLocationRequest),
  ]);
};
