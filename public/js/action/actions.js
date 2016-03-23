import moment from 'moment';
import fetch from 'isomorphic-fetch';

import {compose} from '../util/ruteutils';

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
    } catch (e) {
      console.log('error loading FAVORITTER!', e);
      // wipe FAVORITTER as its not going to parse anyway:
      localStorage.removeItem('FAVORITTER');
    }
  }
};

import RUTE_SEARCH_DATA from './ruteSok';

export const searchRute = (text) => {
  return (dispatch, getState) => {
    // Note that the function also receives getState()
    // which lets you choose what to dispatch next.

    // This is useful for avoiding a network request if
    // a cached value is already available.

    dispatch({type: ActionTypes.RUTE_SEARCH_REQUEST, text: text});
    fetch(`/api/search/rute/${text}`)
      .then((response) => response.json())
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

export const transformRouteIds = (rute) => {
  rute.avganger = rute.avganger.map(avgang => {
    if (avgang.hasOwnProperty('ExpectedDepartureTime')) {
      avgang.ExpectedDepartureTime = moment(avgang.ExpectedDepartureTime);
    }
    if (avgang.hasOwnProperty('AimedDepartureTime')) {
      avgang.AimedDepartureTime = moment(avgang.AimedDepartureTime);
    }
    if (avgang.hasOwnProperty('AimedDepartureTime') && avgang.hasOwnProperty('ExpectedDepartureTime')) {
      avgang.isDelayed = avgang.AimedDepartureTime.isBefore(avgang.ExpectedDepartureTime, 'minute');
    } else {
      avgang.isDelayed = false;
    }
    return avgang;
  });
  return rute;
};

export const addIDToAvganger = (rute) => {
  rute.avganger.map(avgang => {
    avgang.ID = '' + avgang.DestinationRef + avgang.OriginName + avgang.OriginRef + avgang.AimedDepartureTime.unix();
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
        .then((jsonData) => dispatch({
          type: ActionTypes.ROUTEID_LOAD_SUCCESS,
          routeId: routeId,
          result: transformer(jsonData),
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
  })(compose(transformRouteIds, addIDToAvganger));