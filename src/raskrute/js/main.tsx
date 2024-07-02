import React from 'react';
import moment from 'moment';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { ReduxRouter } from '@lagunovsky/redux-react-router';
import * as Sentry from '@sentry/react';
import { StoreContext } from 'storeon/react';
import { reduxStore, storeOnStore } from './store';
import { history } from './store/history';
import App from './components/App';
import Home from './components/Home';
import About from './components/About';
import ViewRoute from './components/ViewRoute';
import ViewFavorites from './components/ViewFavorites';
import ViewJourney from './components/ViewJourney';

import '../css/app.scss';
import '../css/font-awesome.min.css';

if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: 'https://fadd5c6ec13d498b9daba2b837ea7037@app.getsentry.com/72804'
    });
}

ReactGA.initialize('UA-54328875-1');

// assets
moment.locale('nb');

function logPageView() {
    if (process.env.NODE_ENV === 'production') {
        ReactGA.set({ page: window.location.pathname });
        ReactGA.send({ hitType: 'pageview', page: window.location.pathname || '/' });
    }
}

reduxStore.dispatch({
    type: 'init',
});
// reduxStore.dispatch(AppStart());

const Main = () => {
    return (
        <StoreContext.Provider value={ storeOnStore }>
            <Provider store={ reduxStore }>
                <ReduxRouter history={ history }>
                    <App>
                        <Routes>
                            <Route path="/" element={ <Home/> }/>
                            <Route path="/routes/:routeId/:transportMode?" element={ <ViewRoute/> }/>
                            <Route path="/journey/:journeyRef/:timestamp" element={ <ViewJourney/> }/>
                            <Route path="/favorites" element={ <ViewFavorites/> }/>
                            <Route path="/search/:searchQuery" element={ <Home/> }/>
                            <Route path="/about" element={ <About/> }/>
                            {/*<Route path="/*" component={Home} />*/ }
                        </Routes>
                    </App>
                </ReduxRouter>
            </Provider>
        </StoreContext.Provider>
    )
}

export { Main };
