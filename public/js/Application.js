import React from 'react';

import {Router, Route, Link, hashHistory, browserHistory, IndexRoute} from 'react-router';
import {syncHistoryWithStore} from 'react-router-redux';

import {store} from './store/store';
import App from './components/App';
import Home from './components/Home';
import ViewRoute from './components/ViewRoute';
import ViewFavorites from './components/ViewFavorites';
import ViewJourney from './components/ViewJourney';

const history = syncHistoryWithStore(browserHistory, store);

const About = (props) =>
  <div className="row">
    <div className="one column">
      <h5>Begrensninger</h5>
      <article>Foreløpig kan man kun slå opp på enkeltstopp.</article>
      <article>Vi er også begrenset til kun å vise avganger som har sanntidsdata.</article>
    </div>
  </div>;

const Application = ({state}) => {
  return (
    <Router history={history}>
      <Route path="/" component={App}>
        <Route path="/routes/:routeId" component={ViewRoute}/>
        <Route path="/journey/:journeyRef/:timestamp" component={ViewJourney} />
        <Route path="/favorites" component={ViewFavorites}/>
        <Route path="/about" component={About}/>
        <IndexRoute component={Home}/>
      </Route>
    </Router>
  );
};

export default Application;
