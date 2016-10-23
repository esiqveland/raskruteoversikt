// make sure we have Promise and Object.assign polyfills
import 'babel-polyfill';

import Raven from 'raven-js';

if (process.env.NODE_ENV === 'production') {
  Raven
    .config('https://fadd5c6ec13d498b9daba2b837ea7037@app.getsentry.com/72804')
    .install();
}

import moment from 'moment';
moment.locale('nb');

// assets
const appCSS = require('../css/app.less');
const FontAwesome = require('style!../css/font-awesome.min.css');


var Elm = require('../../frontend/Main.elm');

Elm.Main.embed(document.getElementById('app'));
