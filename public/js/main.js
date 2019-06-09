// make sure we have Promise and Object.assign polyfills
import 'babel-polyfill';

import Raven from 'raven-js';

if (process.env.NODE_ENV === 'production') {
  Raven
    .config('https://fadd5c6ec13d498b9daba2b837ea7037@app.getsentry.com/72804')
    .install();
}

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import moment from 'moment';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router';

ReactGA.initialize('UA-54328875-1');

// assets
moment.locale('nb');
const appCSS = require('../css/app.less');
const FontAwesome = require('../css/font-awesome.min.css');


import { AppStart } from './action/actions';
import { createStore } from './store/store';
import App from './components/App';
import Home from './components/Home';
import About from './components/About';
import ViewRoute from './components/ViewRoute';
import ViewFavorites from './components/ViewFavorites';
import ViewJourney from './components/ViewJourney';

const history = createBrowserHistory();
const store = createStore(history)({});
store.dispatch(AppStart());

function logPageView() {
    if(process.env.NODE_ENV === 'production') {
        ReactGA.set({ page: window.location.pathname });
        ReactGA.pageview(window.location.pathname);
    }
}


ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App>
      {/*<Route path="/" component={} onUpdate={logPageView}>*/}
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/routes/:routeId" component={ViewRoute} />
          <Route path="/journey/:journeyRef/:timestamp" component={ViewJourney} />
          <Route path="/favorites" component={ViewFavorites} />
          <Route path="/about" component={About} />
          {/*<Route path="/*" component={Home} />*/}
        </Switch>
      {/*</Route>*/}
      </App>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);

