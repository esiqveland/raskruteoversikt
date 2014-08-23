'use strict';

var raskruteControllers = angular.module('raskruteControllers', ['raskTranfikantenServices']);

var STOPPTYPE = 0;
var AREATYPE = 1;
var POITYPE = 2;
var ADDRTYPE = 3;

raskruteControllers.controller('HomeCtrl', ['$scope', 'Stopp', '$http', '$routeParams',
    function ($scope, Stopp, $http, $routeParams) {
        function filterStops (stops) {
            return stops.filter(function(value, index, list) {
                return value.Type === STOPPTYPE;
            });

        }

      $scope.searchForRute = function (stopp) {
            if(!stopp || stopp === '') {
                return;
            }
            $scope.searchList = Stopp.query({placeId: $scope.search}, function(success) {
                $scope.searchList = filterStops(success);
            }, function(err) {
                console.log(err);
            });
        };
        $scope.search = $routeParams.search;
        $scope.searchForRute($scope.search);

    }
]);

raskruteControllers.controller('RuteDetailCtrl', ['$scope', 'RuteInfo', '$http', '$routeParams', 'StoppID',
    function ($scope, RuteInfo, $http, $routeParams, StoppID) {

      $scope.excludeRuter = [];
      $scope.ruteFilter = function(rute) {
        return $scope.excludeRuter.indexOf(linjenavn(rute)) === -1;
      };
      $scope.toggleFilter = function(rutenr) {
        var linjestreng = linjenavn(rutenr);
        if($scope.excludeRuter.indexOf(linjestreng) === -1) {
          console.log("exclude: " + linjestreng);
          $scope.excludeRuter.push(linjestreng);
        } else {
          console.log("include: " + linjestreng);
          $scope.excludeRuter.splice(_.indexOf($scope.excludeRuter, linjestreng), 1);
        }
        console.log($scope.excludeRuter);

      };
      var linjenavn = function(rute) {
        return rute.PublishedLineName + " " + rute.DestinationName;
      };

      $scope.linjenavn = linjenavn;
      function finnRuter(stops) {
        return _.uniq(stops, function(mystop) { return linjenavn(mystop); })
      };

      RuteInfo.query({ruteId: $routeParams.ruteId}, function(success) {
            $scope.ruteInfo = success;
            $scope.ruter = finnRuter(success);

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
              if(!scope.avgang.ExpectedDepartureTime.isAfter()) {
//                delete scope.avgang;
                scope.$parent.ruteInfo.splice(_.indexOf(scope.$parent.ruteInfo, scope.avgang), 1);

              }
              $compile(element)(scope);
          }
          console.log("directive: ");
          console.log(scope);

          stopTime = $interval(reCompile, time);

          // listen on DOM destroy (removal) event, and cancel the next UI update
          // to prevent updating time ofter the DOM element was removed.
          element.on('$destroy', function() {
              $interval.cancel(stopTime);
          });
      };
});
