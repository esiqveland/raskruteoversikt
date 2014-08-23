'use strict';

var RUTER_ENDPOINT = 'http://reisapi.ruter.no/';

var raskruteServices = angular.module('raskruteServices', ['ngResource']);

// see: http://reisapi.ruter.no/Help/Api/GET-StopVisit-GetDepartures-id_datetime
// GET StopVisit/GetDepartures/{id}?datetime={datetime}
// optional: datetime, null ==> realtime data
raskruteServices.factory('RuteInfo', ['$resource', '$http',
    function ($resource, $http) {

        var dateTransformer = function(data, headersGetter) {
            return data;
        };

        var responseTransformers = $http.defaults.transformResponse.concat([dateTransformer]);

        return $resource(RUTER_ENDPOINT + 'StopVisit/GetDepartures/:ruteId', {ruteId: '@id', callback:'JSON_CALLBACK'}, {
            query: {method: 'JSONP', transformResponse: responseTransformers, isArray: true}
        });
    }
]);

// see: http://reisapi.ruter.no/Help/Api/GET-Place-GetPlaces-id_location
// GET Place/GetPlaces/{id}?location={location}
// Returns a list of Places that have names similar to the search string. If a Location is provided, search results are sorted according to geographical proximity.

raskruteServices.factory('Stopp', ['$resource', '$http',
    function($resource, $http) {

        return $resource(RUTER_ENDPOINT + 'Place/GetPlaces/:placeId', {}, {
            query: {method: 'JSONP', params: {callback:'JSON_CALLBACK'}, isArray: true}
        });
    }
]);
