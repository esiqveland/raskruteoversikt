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
import moment from 'moment';

moment.locale('nb');

import { Provider } from 'react-redux';

import { AppStart } from './action/actions';
import { store } from './store/store';
import Application from './Application';

var appCSS = require('../css/app.less');
var FontAwesome = require('style!../css/font-awesome.min.css');


ReactDOM.render(
  <Provider store={store}>
    <Application />
  </Provider>,
  document.getElementById('app')
);

store.dispatch(AppStart());