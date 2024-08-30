'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const fetch = require('isomorphic-fetch');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const winston = require('winston');
const expressWinston = require('express-winston');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const errorHandler = require('errorhandler');
const express = require('express');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'raskrute' },
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        //new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //new winston.transports.File({ filename: 'combined.log' })
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    ]
});


var config = {
    port: process.env.PORT || 9999,
    servedir: process.env.PUBLIC_FOLDER || '../dist/'
};


var cors = function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET PUT POST DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type Accept');
    next();
};

var app = express();
var api = require('./api/server-api');
import apiv2 from './api/server-api2';

app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(cors);

app.use(expressWinston.logger({
    winstonInstance: logger,
}));
// config
// app.use(express.cookieParser());
// app.use(express.session({ secret: 'cool beans' }));
// app.use(express.methodOverride());
app.use(favicon(path.join(__dirname, '../', 'public', 'images', 'favicon.ico')));

app.use(express.static(path.join(__dirname, config.servedir)));

app.use('/api', api);
app.use('/api/v2', apiv2);

app.get('*', function (req, res, next) {
    let potentialFile = req.url.split('/');
    potentialFile = potentialFile[potentialFile.length - 1];

    const filePath = path.join(__dirname, config.servedir, potentialFile);
    let stat = false;
    try {
        stat = fs.statSync(filePath);
    } catch (err) {
        stat = false;
    }
    if (stat) {
        res.sendFile(filePath);
    } else {
        next();
    }
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, config.servedir, 'index.html'));
});

app.listen(config.port, function () {
    console.log('server is listening on port ' + config.port);
    console.log('server is dealing: ' + config.servedir);
});
