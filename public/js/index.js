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
const FontAwesome = require('style-loader!../css/font-awesome.min.css');

const favs = localStorage.getItem('FAVORITTER');
const favoritter = favs ? JSON.parse(favs) : [];

const elmApp = require('../../frontend/Main.elm');

// elmApp.ports.setStorage.subscribe(function (state) {
//   localStorage.setItem('FAVORITTER', JSON.stringify(state))
// });

const elmStart = document.getElementById('app');
elmApp.Main.embed(elmStart, { favorites: favoritter });
