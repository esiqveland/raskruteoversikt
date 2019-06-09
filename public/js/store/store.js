// thunk lets you dispatch functions and is registered as middleware for dispatch in the redux store
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { applyMiddleware, combineReducers, createStore as createReduxStore } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';

import createRavenMiddleware from '../util/middleware/redux-raven';
import rootSaga from '../action/sagas';
import rootReducer from './reducers';

const loggerMiddleware = createLogger(); // middleware that logs actions
const sagaMW = createSagaMiddleware();

export const createStore = (history) => (initialState) => {
  const middleWares = [
    routerMiddleware(history),  // support react-router actions: push(location), replace(location), go(number), goBack(), goForward()
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

  const store = createReduxStore(
    combineReducers({
      app: rootReducer,
      router: connectRouter(history),
    }),
    initialState,
    reduxMiddlewares
  );

  sagaMW.run(rootSaga);

  return store;
};

