// npm install http body-parser method-override errorhandler express cookie-parser
var http = require("http");
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var express = require('express');

var config = {port: process.env.PORT || 9999}

var cors = function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET PUT POST DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type Accept');
    next();
 };

var app = express();

// config
// app.use(express.bodyParser());
// app.use(express.cookieParser());
// app.use(express.session({ secret: 'cool beans' }));
// app.use(express.methodOverride());
// app.use(cors);
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public/')));

app.listen(config.port, function () {
    console.log('server is listening on port ' + config.port);
});

