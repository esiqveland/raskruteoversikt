import type { RequestHandler } from "express";
import express from 'express';
import apiv2 from './api/server-api2';
import path from "path";
import fs from "fs";
import favicon from "serve-favicon";
import bodyParser from "body-parser";
import winston from "winston";
import expressWinston from "express-winston";
// import cookieParser from "cookie-parser";
// import methodOverride from "method-override";
// import errorHandler from "errorhandler";

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


const config = {
    port: process.env.PORT || 9999,
    servedir: process.env.PUBLIC_FOLDER || '../dist/'
};


const cors: RequestHandler = function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET PUT POST DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type Accept');
    next();
};

const app = express();

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

app.use('/api/v2', apiv2);

app.get('*', function (req, res, next) {
    const parts = req.url.split('/');
    const potentialFile = parts[parts.length - 1];

    const filePath = path.join(__dirname, config.servedir, potentialFile);
    let isOk = false;
    try {
        const stat = fs.statSync(filePath);
        isOk = stat.isFile();
    } catch (err) {
        isOk = false;
    }
    if (isOk) {
        res.sendFile(filePath);
    } else {
        next();
    }
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, config.servedir, 'index.html'));
});

app.listen(config.port, function () {
    console.log(`server is listening on port ${ config.port }`);
    console.log(`server is dealing: ${ config.servedir }`);
});
