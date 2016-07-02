// thunk lets you dispatch functions and is registered as middleware for dispatch in the redux store
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import createRavenLogger from '../util/middleware/redux-raven';

import {Router, Route, Link, hashHistory, browserHistory, IndexRoute} from 'react-router';

import {applyMiddleware, createStore, combineReducers} from 'redux';
import {routerReducer, routerMiddleware} from 'react-router-redux';

import {ActionTypes} from '../action/actions';

export const handleRuteSok = (state = {isFetching: false, hasSearched: false}, action) => {
  switch (action.type) {
    case ActionTypes.RUTE_SEARCH_REQUEST:
      return Object.assign({}, state, {isFetching: true, text: action.text, hasSearched: true});
    case ActionTypes.RUTE_SEARCH_SUCCESS:
      return Object.assign({}, state, {isFetching: false, text: action.text, result: action.result});
    case ActionTypes.RUTE_SEARCH_FAILURE:
      return Object.assign({}, state, {isFetching: false, text: action.text});
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
      return Object.assign({}, state,
        {[action.routeId]: handleRouteId(state[action.routeId], action)}
      );
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
        return Object.assign({}, state, {
          [action.routeId]: {name: action.name, ID: action.routeId, location: action.location},
        });
      }
    default:
      return state;
  }
};

export const handleJourneyRequest = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.JOURNEY_REQUEST:
      return Object.assign({}, state, {isFetching: true, error: null, timestamp: action.date});
    case ActionTypes.JOURNEY_FAILURE:
      return Object.assign({}, state, {isFetching: false, error: action.error, timestamp: null});
    case ActionTypes.JOURNEY_SUCCESS:
      return Object.assign({}, state, {isFetching: false, error: null, stops: action.result});
    default:
      return state;
  }
};

export const handleJourneys = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.JOURNEY_REQUEST:
    case ActionTypes.JOURNEY_FAILURE:
    case ActionTypes.JOURNEY_SUCCESS:
      return Object.assign({}, state, {
        [action.journeyRef]: handleJourneyRequest(state[action.journeyRef], action),
      });
    default:
      return state;
  }
};

export const handlePosition = (state = {isFetching: false, error: null}, action) => {
  switch (action.type) {
    case ActionTypes.SET_POSITION:
      return Object.assign({}, state, {
        isFetching: false,
        error: null,
        timestamp: action.timestamp,
        position: action.position,
      });
    case ActionTypes.SET_POSITION_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error,
        timestamp: action.timestamp,
        // TODO: should we reset position once we receive an error
        // or reuse the data that might be there?
        position: null,
      });
    default:
      return state;
  }
};

const reducer = (state = {}, action) => {
  return {
    favoritter: handleFavoritter(state.favoritter, action),
    sok: handleRuteSok(state.sok, action),
    position: handlePosition(state.position, action),
    journey: handleJourneys(state.journey, action),
    ruter: handleRuter(state.ruter, action),
  };
};

const loggerMiddleware = createLogger(); // middleware that logs actions
const middleWares = [
  routerMiddleware(browserHistory),  // support react-router actions: push(location), replace(location), go(number), goBack(), goForward()
  thunkMiddleware,  // lets us dispatch() functions
];

if (process.env.NODE_ENV === 'production') {
  middleWares.push(createRavenLogger('https://fadd5c6ec13d498b9daba2b837ea7037@app.getsentry.com/72804'));
} else {
  middleWares.push(loggerMiddleware);
}

export const store = createStore(
  combineReducers({
    app: reducer,
    routing: routerReducer,
  }),
  applyMiddleware(
    ...middleWares
  )
);

