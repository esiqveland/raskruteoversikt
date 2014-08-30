'use strict';

var raskrute = angular.module('raskruteApp', [
    'ngRoute',
    'ngResource',
    'mm.foundation',
    'snap',
    'raskruteControllers',
    'raskTranfikantenServices'
]);

moment.locale("nb");

angular.module('raskruteControllers', ['raskTranfikantenServices']);

var STOPPTYPE = 0;
var AREATYPE = 1;
var POITYPE = 2;
var ADDRTYPE = 3;
var FAVORITTER = "favoritter";

raskrute.config(['$routeProvider', '$httpProvider', '$locationProvider',
    function($routeProvider, $httpProvider, $locationProvider) {
        $routeProvider.
            when('/home', {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }).
            when('/home/:ruteId', {
                templateUrl: 'templates/rute.html',
                controller: 'RuteDetailCtrl'
            }).
            otherwise({
                redirectTo: '/home'
            });
//          $loctionProvider.html5Mode(true);
//    $httpProvider.defaults.useXDomain = true;
//    $httpProvider.defaults.withCredentials = true;
//    delete $httpProvider.defaults.headers.common["X-Requested-With"];
//    $httpProvider.defaults.headers.common["Accept"] = "application/json";
//    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";

    }]);
