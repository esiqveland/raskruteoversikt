import moment from "moment";
import fetch from "isomorphic-fetch";
import { utmToLatLong, compose } from "../util/ruteutils";
import { JourneyDateTimePattern, parseJourneyTimestamps, calculateDepartureDiffs } from "../util/Journey";
import { position as selectPosition, location as selectLocation } from './selectors';

export const ActionTypes = {
  SETTINGS_LOAD: 'SETTINGS_LOAD',
  SETTINGS_SAVE: 'SETTINGS_SAVE',
  SETTINGS_SET: 'SETTINGS_SET',
  RUTE_SEARCH: 'RUTE_SEARCH',
  RUTE_SEARCH_REQUEST: 'RUTE_SEARCH_REQUEST',
  RUTE_SEARCH_FAILURE: 'RUTE_SEARCH_FAILURE',
  RUTE_SEARCH_SUCCESS: 'RUTE_SEARCH_SUCCESS',
  ROUTEID_LOAD_REQUEST: 'ROUTEID_LOAD_REQUEST',
  ROUTEID_LOAD_SUCCESS: 'ROUTEID_LOAD_SUCCESS',
  ROUTEID_LOAD_FAILURE: 'ROUTEID_LOAD_FAILURE',

  FAVORITE_TOGGLE: 'FAVORITE_TOGGLE',
  FAVORITE_LOAD: 'FAVORITE_LOAD',
  JOURNEY_REQUEST: 'JOURNEY_REQUEST',
  JOURNEY_SUCCESS: 'JOURNEY_SUCCESS',
  JOURNEY_FAILURE: 'JOURNEY_FAILURE',
  SET_POSITION: 'SET_POSITION',
  SET_POSITION_FAILURE: 'SET_POSITION_FAILURE',
  TRACK_LOCATION_REQUEST: 'TRACK_LOCATION_REQUEST',
  GET_CLOSEST_REQUEST: 'GET_CLOSEST_REQUEST',
  GET_CLOSEST_SUCCESS: 'GET_CLOSEST_SUCCESS',
  GET_CLOSEST_FAILED: 'GET_CLOSEST_FAILED',
};

export const AppStart = () => {
  return (dispatch, getState) => {
    dispatch(loadFavorites());
  };
};

export const getClosestRequest = () => {
  return {
    type: ActionTypes.GET_CLOSEST_REQUEST,
  };
};
export const getClosestFailed = (errormsg) => {
  return {
    type: ActionTypes.GET_CLOSEST_FAILED,
    error: errormsg,
  };
};
export const getClosestSuccess = (data) => {
  return {
    type: ActionTypes.GET_CLOSEST_SUCCESS,
    data: data,
  };
};

export const setFavorites = (favoritter = {}) => {
  return {
    type: ActionTypes.FAVORITE_LOAD,
    favoritter: favoritter,
  };
};

export const toggleFavorite = (routeId, name, location) => {
  return {
    type: ActionTypes.FAVORITE_TOGGLE,
    routeId: routeId,
    name: name,
    location: location,
  };
};

export const journeyRequest = (journeyRef, dateTime) => {
  return {
    type: ActionTypes.JOURNEY_REQUEST,
    journeyRef: journeyRef,
    date: dateTime,
  };
};
export const journeyRequestSuccess = (journeyRef, dateTime, result) => {
  return {
    type: ActionTypes.JOURNEY_SUCCESS,
    journeyRef: journeyRef,
    date: dateTime,
    result: result,
  };
};
export const journeyRequestFailed = (journeyRef, timestamp, error) => {
  return {
    type: ActionTypes.JOURNEY_FAILURE,
    journeyRef: journeyRef,
    date: timestamp,
    error: error,
  };
};

export const LoadJourney = (journeyRef, dateTime) => {
  if (moment.isMoment(dateTime)) {
    dateTime = dateTime.format(JourneyDateTimePattern);
  }
  const transformResponse = compose(parseJourneyTimestamps, calculateDepartureDiffs);
  return (dispatch, getState) => {
    dispatch(journeyRequest(journeyRef, dateTime));
    const URL = `/api/journey/${journeyRef}/${dateTime}`;
    fetch(URL)
      .then(res => res.json())
      .then(jsondata => transformResponse(jsondata))
      .then(jsondata => {
        dispatch(journeyRequestSuccess(journeyRef, dateTime, jsondata));
      })
      .catch(err => {
        console.log(`error fetching url "${URL}"`, err);
        dispatch(journeyRequestFailed(journeyRef, dateTime, 'Vi beklager så mye at noe gikk galt :('));
      });
  }
};

export const ToggleFavoriteAndSave = (routeId, name, location) => {
  return (dispatch, getState) => {
    dispatch(toggleFavorite(routeId, name, location));
    try {
      let json = JSON.stringify(Object.assign({}, getState().app.favoritter, { last_saved: new Date() }));
      localStorage.setItem('FAVORITTER', json);
    } catch (e) {
      console.log('Error storing FAVORITTER: ', e);
    }
  }
};

export const setPositionError = (code, message) => {
  return {
    type: ActionTypes.SET_POSITION_FAILURE,
    message: message,
    error: { code, message },
  };
};

export const setPosition = (position) => {
  return {
    type: ActionTypes.SET_POSITION,
    timestamp: Date.now(),
    position: position,
  }
};


export function trackLocationRequest() {
  return {
    type: ActionTypes.TRACK_LOCATION_REQUEST,
  }
}

export function trackLocation() {
  return (dispatch, getState) => {
    try {
      const state = getState();
      const { isWatching } = selectPosition(state);
      if (!isWatching) {
        dispatch(trackLocationRequest());
        return new Promise((resolve, reject) => {
          startGeoLocation(resolve, reject, dispatch, window.navigator);
        });
      } else {
        const { latitude, longitude } = selectLocation(state);
        return Promise.resolve({ result: {} });
      }
    } catch (err) {
      console.log('error with geolocation: ', err);
      return Promise.reject(err);
    }
  }
}

/**
 * startGeoLocation sets up an initial location for phone, and starts a watch.
 * Also sets up an error if location is not available.
 * @param dispatch  function to dispatch actions
 * @param nav       browser navigator object.
 */
function startGeoLocation(resolve, reject, dispatch, nav) {
  if (nav.geolocation) {
    // navigator.geolocation.getCurrentPosition(loc => {
    //   dispatch(setPosition(loc));
    // }, err => {
    //   dispatch(setPositionError(err.code, err.message));
    // });

    let didResolve = false;
    nav.geolocation.watchPosition(pos => {
      dispatch(setPosition(pos));
      if (didResolve) {
        return;
      } else {
        resolve({ result: pos });
        didResolve = true;
      }
    }, err => {
      dispatch(setPositionError(err.code, err.message));
      if (didResolve) {

      } else {
        resolve({ error: err });
        didResolve = true;
      }
    });
  } else {
    // TODO: do something, we dont have geolocation in this browser
    dispatch(setPositionError(-1, 'No geolocation available in browser.'));
    resolve({ error: 'No geolocation available in browser.' });
  }
}

export function loadFavorites() {
  return (dispatch, getState) => {
    let state = {};
    try {
      let data = localStorage.getItem('FAVORITTER');
      state = JSON.parse(data);
    } catch (err) {
      console.log('error loading FAVORITTER!', err);
      // wipe FAVORITTER as its not going to parse anyway:
      try {
        localStorage.removeItem('FAVORITTER');
      } catch (err) {
      }
    }
    dispatch(setFavorites(state));
  }
}

export const ruteSearchRequest = (text) => {
  return {
    type: ActionTypes.RUTE_SEARCH_REQUEST,
    text: text,
  }
};
export const ruteSearchFailed = (error) => {
  return {
    type: ActionTypes.RUTE_SEARCH_FAILURE,
    error: error,
  }
};
export const ruteSearchSuccess = (listOfStops) => {
  return {
    type: ActionTypes.RUTE_SEARCH_SUCCESS,
    result: listOfStops,
  }
};

export const searchRute = (text) => {
  return (dispatch, getState) => {
    // Note that the function also receives getState()
    // which lets you choose what to dispatch next.

    // This is useful for avoiding a network request if
    // a cached value is already available.

    dispatch({ type: ActionTypes.RUTE_SEARCH_REQUEST, text: text });
    fetch(`/api/search/${text}`)
      .then(response => response.json())
      .then(response => response.filter(result => result.PlaceType === 'Stop'))
      .then(jsonData => dispatch(ruteSearchSuccess(jsonData)))
      .catch(err => {
        console.log('Error fetching data: ', err);
        dispatch(ruteSearchFailed('Vi beklager så mye, men noe gikk galt :('));
      });
  };
};

export const convertLocation = (rute) => {
  return Object.assign({}, rute, { location: utmToLatLong(rute.Y, rute.X) });
};

export const transformAvgangData = (rute) => {
  rute.avganger = rute.avganger.map(avgang => {
    return {
      Extensions: avgang.Extensions,
      LineColour: avgang.Extensions.LineColour,
      DestinationName: avgang.MonitoredVehicleJourney.DestinationName,
      LineRef: avgang.MonitoredVehicleJourney.LineRef,
      VehicleJourneyName: avgang.MonitoredVehicleJourney.VehicleJourneyName,
      PublishedLineName: avgang.MonitoredVehicleJourney.PublishedLineName,
      VehicleAtStop: avgang.MonitoredVehicleJourney.MonitoredCall.VehicleAtStop,
      AimedArrivalTime: moment(avgang.MonitoredVehicleJourney.MonitoredCall.AimedArrivalTime),
      AimedDepartureTime: moment(avgang.MonitoredVehicleJourney.MonitoredCall.AimedDepartureTime),
      ExpectedDepartureTime: moment(avgang.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime),
      ExpectedArrivalTime: moment(avgang.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime),
      DestinationDisplay: avgang.MonitoredVehicleJourney.MonitoredCall.DestinationDisplay,
      DeparturePlatformName: avgang.MonitoredVehicleJourney.MonitoredCall.DeparturePlatformName,
      RecordedAtTime: moment(avgang.RecordedAtTime),
      MonitoringRef: avgang.MonitoringRef
    };
  });
  return rute;
};

export const transformRouteIds = (rute) => {
  rute.avganger = rute.avganger.map(avgang => {
    if (avgang.hasOwnProperty('AimedDepartureTime') && avgang.hasOwnProperty('ExpectedDepartureTime')) {
      avgang.isDelayed = avgang.AimedDepartureTime.isBefore(avgang.ExpectedDepartureTime, 'minute');
    } else {
      avgang.isDelayed = false;
    }
    return avgang;
  });
  return rute;
};

export const removeNotMonitored = (rute) => {
  // rute.avganger = rute.avganger.filter(avgang => avgang.MonitoredVehicleJourney.Monitored === true);
  return rute;
};

export const addIDToAvganger = (rute) => {
  rute.avganger.map(avgang => {
    avgang.ID = '' + avgang.MonitoringRef + avgang.LineRef + avgang.LineColour + avgang.AimedDepartureTime.unix() + avgang.ExpectedDepartureTime.unix();
    return avgang;
  });

  return rute;
};

export const loadRouteWithId = (routeId, refreshHandler = () => { /* no-op */
}) => {
  return (dispatch, getState) => {
    dispatch({ type: ActionTypes.ROUTEID_LOAD_REQUEST, routeId: routeId });
    const transformer = compose(removeNotMonitored, transformAvgangData, transformRouteIds, addIDToAvganger, convertLocation);

    fetch(`/api/routes/${routeId}`)
      .then((response) => response.json())
      .then(jsonData => transformer(jsonData))
      .then((jsonData) => dispatch({
        type: ActionTypes.ROUTEID_LOAD_SUCCESS,
        routeId: routeId,
        result: jsonData,
      }))
      .catch((error) => {
        console.log('Error fetching routeid: ', routeId, error);
        dispatch({
          type: ActionTypes.ROUTEID_LOAD_FAILURE,
          routeId: routeId,
          error: 'Vi beklager så mye, men noe gikk galt :('
        });
      });
  }
};

  