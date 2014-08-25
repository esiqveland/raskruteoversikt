'use strict';

var RUTER_ENDPOINT = 'http://reis.trafikanten.no/ReisRest/';

var raskTranfikantenServices = angular.module('raskTranfikantenServices', ['ngResource']);

//http://reis.trafikanten.no/reisrest/help/operations/GetRealTimeData
raskTranfikantenServices.factory('RuteInfo', ['$resource', '$http',
    function ($resource, $http) {

        var dateTransformer = function(data, headersGetter) {
            if(Array.isArray(data)) {
                angular.forEach(data, function(value) {
                    if(value.hasOwnProperty('ExpectedDepartureTime')) {
                        value.ExpectedDepartureTime = moment(value.ExpectedDepartureTime);
                    }
                    if(value.hasOwnProperty('AimedDepartureTime')) {
                      value.AimedDepartureTime = moment(value.AimedDepartureTime);
                    }
                    if(value.AimedDepartureTime.isBefore(value.ExpectedDepartureTime, 'minute')) {
                      value.isDelayed = true;
                    } else {
                      value.isDelayed = false;
                    }

                });
            }
            return data;
        };

        var responseTransformers = $http.defaults.transformResponse.concat([dateTransformer]);
        return $resource(RUTER_ENDPOINT + 'RealTime/GetRealTimeData/:ruteId', {ruteId: '@id', callback:'JSON_CALLBACK'}, {
            query: {method: 'JSONP', transformResponse: responseTransformers, isArray: true}
        });
    }
]);

raskTranfikantenServices.factory('Stopp', ['$resource', function($resource) {
        return $resource(RUTER_ENDPOINT + 'Place/FindMatches/:placeId', {}, {
            query: {method: 'JSONP', params: {callback:'JSON_CALLBACK'}, isArray: true}
        });
    }
]);

raskTranfikantenServices.factory('StoppID', ['$resource', function($resource) {
    return $resource(RUTER_ENDPOINT + 'Place/FindMatches/:placeId', {}, {
        query: {method: 'JSONP', params: {callback:'JSON_CALLBACK'}, isArray: true}
    });
}
]);
