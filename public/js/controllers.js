'use strict';

var raskruteControllers = angular.module('raskruteControllers', ['raskTranfikantenServices']);

var STOPPTYPE = 0;
var AREATYPE = 1;
var POITYPE = 2;
var ADDRTYPE = 3;

raskruteControllers.controller('HomeCtrl', ['$scope', 'Stopp', '$http',
    function ($scope, Stopp, $http) {
        function filterStops (stops) {
            return stops.filter(function(value, index, list) {
                return value.Type === STOPPTYPE;
            });

        }
        $scope.searchForRute = function (stopp) {
            console.log("search: ");
            $scope.searchList = Stopp.query({placeId: $scope.search}, function(success) {
                console.log("success" + success);
                $scope.searchList = filterStops(success);
                console.log($scope.searchList);

            }, function(err) {
                console.log('err');
                console.log(err);
            });

        };
        $scope.search = 'Sinsen';
        $scope.searchForRute('Sinsen');

    }
]);

raskruteControllers.controller('RuteDetailCtrl', ['$scope', 'RuteInfo', '$http', '$routeParams', 'StoppID',
    function ($scope, RuteInfo, $http, $routeParams, StoppID) {

        RuteInfo.query({ruteId: $routeParams.ruteId}, function(success) {
            $scope.ruteInfo = success;
            console.log('RuteInfo');
            console.log(success);

        }, function(err) { console.log(err); });


        StoppID.query({placeId: $routeParams.ruteId}, function (success) {
            $scope.stasjon = success;
            console.log('stasjon: ');
            console.log(success);
        });
    }
]).directive('momentInterval', function($interval, $compile) {
      return function(scope, element, attrs) {
          var stopTime; // so that we can cancel the time updates
          var time = attrs.momentInterval ? parseInt(attrs.momentInterval, 10) : 1000;

          // used to update the UI
          function reCompile() {
              if(scope.avgang.AimedDepartureTime.isAfter()) {
                element.remove();
              }
              $compile(element)(scope);


          }
          console.log("directive: " + scope);
          console.log(scope);

          stopTime = $interval(reCompile, time);

          // listen on DOM destroy (removal) event, and cancel the next UI update
          // to prevent updating time ofter the DOM element was removed.
          element.on('$destroy', function() {
              $interval.cancel(stopTime);
          });
      };
});
