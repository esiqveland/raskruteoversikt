'use strict';

var RUTER_ENDPOINT = '/';

var raskruteServices = angular.module('raskruteServices', ['ngResource']);

// see: http://reisapi.ruter.no/Help/Api/GET-StopVisit-GetDepartures-id_datetime
// GET StopVisit/GetDepartures/{id}?datetime={datetime}
// optional: datetime, null ==> realtime data
raskruteServices.factory('RuteInfo', ['$resource', '$http',
    function ($resource) {

        var dateTransformer = function(data, headersGetter) {
            return data;
        };

        var responseTransformers = $http.defaults.transformResponse.concat([dateTransformer]);


        return $resource(RUTER_ENDPOINT + 'StopVisit/GetDepartures/:ruteId', {ruteId: '@id'}, {
            query: {method: 'GET', transformResponse: responseTransformers, isArray: true}
        });

    }
]);