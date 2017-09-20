// make sure we have Promise and Object.assign polyfills
import 'babel-polyfill';

import Elm from '../../frontend/Main.elm';

import { FAVORITTER_KEY } from './util/constants';
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



const favs = localStorage.getItem(FAVORITTER_KEY);
const favoritter = favs ? JSON.parse(favs) : {};

const initFlags = { favorites: favoritter };

const elmStart = document.getElementById('app');
const app = Elm.Main.embed(elmStart, JSON.stringify(initFlags));

app.ports.storeFavorites.subscribe(data => {
    console.log('storeFavorites sub got', data);
    if (localStorage && localStorage.setItem) {
        localStorage.setItem(FAVORITTER_KEY, data);
    }
})

// elmApp.ports.setStorage.subscribe(function (state) {
//   localStorage.setItem(FAVORITTER_KEY, JSON.stringify(state))
// });

