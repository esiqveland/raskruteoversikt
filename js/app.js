'use strict';

var raskrute = angular.module('raskruteApp', [
    'ngRoute',
    'ngResource',
    'raskruteControllers'
]);

raskrute.config(['$routeProvider',
    function($routeProvider) {
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
    }]);
