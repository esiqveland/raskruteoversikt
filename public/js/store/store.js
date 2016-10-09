// thunk lets you dispatch functions and is registered as middleware for dispatch in the redux store
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { Router, Route, Link, hashHistory, browserHistory, IndexRoute } from 'react-router';
import { applyMiddleware, createStore as createReduxStore, combineReducers } from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux';

import createRavenMiddleware from '../util/middleware/redux-raven';
import rootSaga from '../action/sagas';
import rootReducer from './reducers';

const loggerMiddleware = createLogger(); // middleware that logs actions
const sagaMW = createSagaMiddleware();
const middleWares = [
  routerMiddleware(browserHistory),  // support react-router actions: push(location), replace(location), go(number), goBack(), goForward()
  thunkMiddleware,  // lets us dispatch() functions
  sagaMW,
];

if (process.env.NODE_ENV === 'production') {
  middleWares.push(createRavenMiddleware('https://fadd5c6ec13d498b9daba2b837ea7037@app.getsentry.com/72804'));
}
if (process.env.NODE_ENV === 'development') {
  middleWares.push(loggerMiddleware);
}

const reduxMiddlewares = applyMiddleware(...middleWares);

export const createStore = (initialState) => {
  const store = createReduxStore(
    combineReducers({
      app: rootReducer,
      routing: routerReducer,
    }),
    initialState,
    reduxMiddlewares
  );

  sagaMW.run(rootSaga);

  return store;
};

