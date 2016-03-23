// thunk lets you dispatch functions and is registered as middleware for dispatch in the redux store
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'

import {Router, Route, Link, hashHistory, browserHistory, IndexRoute} from 'react-router'

import {applyMiddleware, createStore, combineReducers} from 'redux';
import {routerReducer, routerMiddleware} from 'react-router-redux';

import {ActionTypes} from '../action/actions';

// TODO: this function is not pure, should be moved
const saveSettings = (state) => {
  try {
    let json = JSON.stringify(state);
    sessionStorage.setItem('SETTINGS', json);
    return true;
  } catch (e) {
    console.log('error saving state!');
  }
  return false;
};

// TODO: this function is not pure, should be moved
const loadSettings = (state = {}) => {
  try {
    let json = sessionStorage.getItem('SETTINGS');
    state = JSON.parse(json);
  } catch (e) {
    console.log('error loading state!', e);
    // wipe state as its not going to parse anyway:
    localStorage.removeItem('SETTINGS');
  }
  return state
};

export const handleSettings = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.SETTINGS_SAVE:
      saveSettings(state);
      return Object.assign({}, state, {last_saved: new Date()});
    case ActionTypes.SETTINGS_LOAD:
      return loadSettings();
    case ActionTypes.SETTINGS_SET:
      return action.settings;
    default:
      return state;
  }
};

export const handleRuteSok = (state = {hasSearched: false}, action) => {
  switch (action.type) {
    case ActionTypes.RUTE_SEARCH_REQUEST:
      return Object.assign({}, state, {isLoading: true, text: action.text, hasSearched: true, isFetching: true});
    case ActionTypes.RUTE_SEARCH_SUCCESS:
      return Object.assign({}, state, {isLoading: false, text: action.text, result: action.result, isFetching: false});
    case ActionTypes.RUTE_SEARCH_FAILURE:
      return Object.assign({}, state, {isLoading: false, text: action.text, isFetching: false});
    default:
      return state;
  }
};


export const handleRouteId = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.ROUTEID_LOAD_REQUEST:
      return Object.assign({}, state, {isFetching: true, error: false, errorMessage: undefined});
    case ActionTypes.ROUTEID_LOAD_SUCCESS:
      return Object.assign({}, state, action.result, {isFetching: false});
    case ActionTypes.ROUTEID_LOAD_FAILURE:
      return Object.assign({}, state, {isFetching: false, error: true, errorMessage: action.error});
    default:
      return state;
  }
};

export const handleRuter = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.ROUTEID_LOAD_REQUEST:
    case ActionTypes.ROUTEID_LOAD_SUCCESS:
    case ActionTypes.ROUTEID_LOAD_FAILURE:
      return Object.assign({}, state, {[action.routeId]: handleRouteId(state[action.routeId], action)});
    default:
      return state;
  }
};
export const handleFavoritter = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.FAVORITE_LOAD:
      return Object.assign({}, state, action.favoritter);
    case ActionTypes.FAVORITE_TOGGLE:
      if (state.hasOwnProperty(action.routeId)) {
        return Object.keys(state)
          .filter((key) => key !== action.routeId.toString())
          .reduce((newState, key) => {
            newState[key] = state[key];
            return newState;
          }, {});
      } else {
        return Object.assign({}, state, {[action.routeId]: {name: action.name}});
      }
    default:
      return state;
  }
};

const reducer = (state = {}, action) => {
  return {
    favoritter: handleFavoritter(state.favoritter, action),
    settings: handleSettings(state.settings, action),
    sok: handleRuteSok(state.sok, action),
    ruter: handleRuter(state.ruter, action),
  };
};

const loggerMiddleware = createLogger();

export const store = createStore(
  combineReducers({
    app: reducer,
    routing: routerReducer,
  }),
  applyMiddleware(
    routerMiddleware(hashHistory),  // support react-router actions: push(location), replace(location), go(number), goBack(), goForward()
    thunkMiddleware,  // lets us dispatch() functions
    loggerMiddleware // middleware that logs actions
  )
);

