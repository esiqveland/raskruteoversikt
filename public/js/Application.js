import React from 'react';

import {Router, Route, Link, hashHistory, browserHistory, IndexRoute} from 'react-router';
import {syncHistoryWithStore} from 'react-router-redux';

import {store} from './store/store';
import App from './components/App';
import Home from './components/Home';
import ViewRoute from './components/ViewRoute';
import ViewFavorites from './components/ViewFavorites';

const history = syncHistoryWithStore(hashHistory, store);

const About = (props) =>
  <div className="row">
    <div className="one column">
      Prosjekt
    </div>
  </div>;

const Application = ({state}) => {
  return (
    <Router history={history}>
      <Route path="/" component={App}>
        <Route path="/routes/:routeId" component={ViewRoute}/>
        <Route path="/favorites" component={ViewFavorites}/>
        <Route path="/about" component={About}/>
        <IndexRoute component={Home}/>
      </Route>
    </Router>
  );
};

export default Application;
