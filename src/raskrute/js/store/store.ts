// thunk lets you dispatch functions and is registered as middleware for dispatch in the redux store
import { thunk } from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { history } from './history';
import { applyMiddleware, combineReducers, createStore as createReduxStore, Middleware } from 'redux';
import { createRouterMiddleware, createRouterReducer } from '@lagunovsky/redux-react-router';

import createRavenMiddleware from '../util/middleware/redux-raven';
import rootReducer from './reducers';

const loggerMiddleware = createLogger(); // middleware that logs actions

export const createStore = (initialState: {}) => {
    const middleWares: Array<Middleware> = [
        createRouterMiddleware(history),  // support react-router actions: push(location), replace(location), go(number), goBack(), goForward()
        thunk,  // lets us dispatch() functions
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
            router: createRouterReducer(history),
        }),
        {
            app: initialState as any,
            // router:
        },
        reduxMiddlewares
    );

    return store;
};

export const reduxStore = createStore({});
