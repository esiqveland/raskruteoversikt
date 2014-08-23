'use strict';

var raskrute = angular.module('raskruteApp', [
    'ngRoute',
    'ngResource',
    'angular-moment',
    'raskruteControllers',
    'raskTranfikantenServices'
]);

raskrute.config(['$httpProvider', function ($httpProvider) {
//    $httpProvider.defaults.useXDomain = true;
//    $httpProvider.defaults.withCredentials = true;
//    delete $httpProvider.defaults.headers.common["X-Requested-With"];
//    $httpProvider.defaults.headers.common["Accept"] = "application/json";
//    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
}]);

raskrute.config(['$routeProvider', '$httpProvider',
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
