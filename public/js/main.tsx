import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ReactGA from 'react-ga';
import { ConnectedRouter } from 'connected-react-router';
import Raven from 'raven-js';
import StoreContext from 'storeon/react/context'

if (process.env.NODE_ENV === 'production') {
    Raven
        .config('https://fadd5c6ec13d498b9daba2b837ea7037@app.getsentry.com/72804')
        .install();
}

ReactGA.initialize('UA-54328875-1');

// assets
moment.locale('nb');
const appCSS = require('../css/app.less');
const FontAwesome = require('../css/font-awesome.min.css');


import { storeOnStore } from './store';
import { reduxStore } from './store';
import { AppStart } from './action/actions';
import { history } from './store/history';
import App from './components/App';
import Home from './components/Home';
import About from './components/About';
import ViewRoute from './components/ViewRoute';
import ViewFavorites from './components/ViewFavorites';
import ViewJourney from './components/ViewJourney';

function logPageView() {
    if(process.env.NODE_ENV === 'production') {
        ReactGA.set({ page: window.location.pathname });
        ReactGA.pageview(window.location.pathname);
    }
}

reduxStore.dispatch(AppStart());

export default function Main() {

    ReactDOM.render(
        <StoreContext.Provider value={ storeOnStore }>
            <Provider store={ reduxStore }>
                <ConnectedRouter history={ history }>
                    <App>
                        {/*<Route path="/" component={} onUpdate={logPageView}>*/ }
                        <Switch>
                            <Route exact path="/" component={ Home }/>
                            <Route path="/routes/:routeId/:transportMode?" component={ ViewRoute }/>
                            <Route path="/journey/:journeyRef/:timestamp" component={ ViewJourney }/>
                            <Route path="/favorites" component={ ViewFavorites }/>
                            <Route path="/about" component={ About }/>
                            {/*<Route path="/*" component={Home} />*/ }
                        </Switch>
                        {/*</Route>*/ }
                    </App>
                </ConnectedRouter>
            </Provider>
        </StoreContext.Provider>,
        document.getElementById('app')
    );
}
