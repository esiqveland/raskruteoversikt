import moment from "moment";
import fetch from "isomorphic-fetch";
import {compose} from "../util/ruteutils";
import {JourneyDateTimePattern, parseJourneyTimestamps, calculateDepartureDiffs} from "../util/Journey";

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
};

export const loadFavorites = (favoritter = {}) => {
  return {
    type: ActionTypes.FAVORITE_LOAD,
    favoritter: favoritter,
  };
};

export const toggleFavorite = (routeId, name) => {
  return {
    type: ActionTypes.FAVORITE_TOGGLE,
    routeId: routeId,
    name: name,
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

export const LoadJourney = (transformResponse =>
  (journeyRef, dateTime) => {
    if (moment.isMoment(dateTime)) {
      dateTime = dateTime.format(JourneyDateTimePattern);
    }
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
  })(compose(parseJourneyTimestamps, calculateDepartureDiffs));

export const ToggleFavoriteAndSave = (routeId, name) => {
  return (dispatch, getState) => {
    dispatch(toggleFavorite(routeId, name));
    try {
      let json = JSON.stringify(Object.assign({}, getState().app.favoritter, {last_saved: new Date()}));
      localStorage.setItem('FAVORITTER', json);
    } catch (e) {
      console.log('Error storing FAVORITTER: ', e);
    }
  }
};

export const AppStart = () => {
  return (dispatch, getState) => {
    try {
      let json = localStorage.getItem('FAVORITTER');
      let state = JSON.parse(json);
      dispatch(loadFavorites(state || {}));
    } catch (err) {
      console.log('error loading FAVORITTER!', err);
      // wipe FAVORITTER as its not going to parse anyway:
      try {
        localStorage.removeItem('FAVORITTER');
      } catch (err) {

      }
    }
  }
};

export const searchRute = (text) => {
  return (dispatch, getState) => {
    // Note that the function also receives getState()
    // which lets you choose what to dispatch next.

    // This is useful for avoiding a network request if
    // a cached value is already available.

    dispatch({type: ActionTypes.RUTE_SEARCH_REQUEST, text: text});
    fetch(`/api/search/${text}`)
      .then((response) => response.json())
      .then((response) => response.filter(result => result.PlaceType === 'Stop'))
      .then((jsonData) => dispatch({type: ActionTypes.RUTE_SEARCH_SUCCESS, result: jsonData}))
      .catch((error) => {
        console.log('Error fetching data: ', error);
        dispatch({type: ActionTypes.RUTE_SEARCH_FAILURE, error: 'Vi beklager så mye, men noe gikk galt :('});
      });
    // setTimeout(() => {
    //   dispatch({type: ActionTypes.RUTE_SEARCH_SUCCESS, result: RUTE_SEARCH_DATA})
    // }, 1000);
  };
  // return {
  //   type: ActionTypes.RUTE_SEARCH,
  //   text: text,
  // };
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

export const loadRouteWithId = ((transformer) =>
  (routeId) => {
    return (dispatch, getState) => {
      dispatch({type: ActionTypes.ROUTEID_LOAD_REQUEST, routeId: routeId});

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
  })(compose(removeNotMonitored, transformAvgangData, transformRouteIds, addIDToAvganger));