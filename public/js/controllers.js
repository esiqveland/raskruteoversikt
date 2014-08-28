'use strict';

var raskruteControllers = angular.module('raskruteControllers', ['raskTranfikantenServices']);

var STOPPTYPE = 0;
var AREATYPE = 1;
var POITYPE = 2;
var ADDRTYPE = 3;
var FAVORITTER = "favoritter";

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
        return Stopp.query({placeId: stopp}, function(success) {
                $scope.searchList = filterStops(success);
                console.log(success);

                return $scope.searchList;
            }, function(err) {
                console.log(err);
            });
        };
        $scope.searchForRute($routeParams.search);
    }
]);

raskruteControllers.controller('FavorittCtrl', ['$scope', 'RuteInfo', '$http', '$routeParams', 'StoppID',
  function ($scope, RuteInfo, $http, $routeParams, StoppID) {
    if(!localStorage.getItem(FAVORITTER)) {
      $scope.favoritter = [];
    } else {
      try {
        $scope.favoritter = angular.fromJson(localStorage.getItem(FAVORITTER));
        console.log("loaded favoritter");
        console.log($scope.favoritter);
      } catch (ex) {
        console.log('failed reading localstorage '+FAVORITTER);
        delete localStorage[FAVORITTER];
        $scope.favoritter = [];
      }
    };

    $scope.isFavoritt = function(favoritt) {
      if(favoritt === undefined || !favoritt.hasOwnProperty('ID') ) {
        return false;
      }
      return favContains(favoritt) === undefined;
    };
    function favContains(favoritt) {
      return _.find($scope.favoritter, function(value) {
        return value.ID === favoritt.ID;
      })
    };

    $scope.toggleFavoritt = function (stasjon) {
      var favoritt = {ID: stasjon.ID, Name: stasjon.Name};

      var match = favContains(favoritt);
      if (match === undefined) {
        console.log("added: " + favoritt);
        $scope.favoritter.push(favoritt);
      } else {
        console.log("removed: " + favoritt);
        _.remove($scope.favoritter, function (value) {
          return value.ID === favoritt.ID;
        });
      }
      console.log($scope.favoritter);
      localStorage.setItem(FAVORITTER, angular.toJson($scope.favoritter));
    };

    if($routeParams.ruteId) {
      StoppID.query({placeId: $routeParams.ruteId}, function (success) {
        if(success.length > 0) {
          $scope.stasjon = success[0];
          console.log($scope.stasjon);
        }

      });
    }


  }]);

raskruteControllers.controller('RuteDetailCtrl', ['$scope', 'RuteInfo', '$http', '$routeParams', 'StoppID',
    function ($scope, RuteInfo, $http, $routeParams, StoppID) {

      try {
        var ruter = angular.fromJson(localStorage.getItem('excludeRuter'));
        if(Array.isArray(ruter)) {
          throw new Error('is array, old delete it!');
        }

        if(!ruter.hasOwnProperty($routeParams.ruteId)) {
          ruter[$routeParams.ruteId] = [];
        }
        $scope.excludeRuter = ruter;
      } catch (ex) {
        console.log('failed reading localstorage');
        delete localStorage['excludeRuter'];
        var ruter = {};
        ruter[$routeParams.ruteId] = [];
        $scope.excludeRuter = ruter;
      }

      refreshRuteDetails();

      var isRuteExcluded = function(rute) {
        if(!$scope.excludeRuter.hasOwnProperty($routeParams.ruteId)) {
          return true;
        }
        return $scope.excludeRuter[$routeParams.ruteId].indexOf(linjenavn(rute)) === -1;
      };
      $scope.ruteFilter = isRuteExcluded;

      $scope.toggleFilter = function(rute) {
        var linjestreng = linjenavn(rute);
        if(isRuteExcluded(rute)) {
          $scope.excludeRuter[$routeParams.ruteId].push(linjestreng);
        } else {
          $scope.excludeRuter[$routeParams.ruteId].splice(_.indexOf($scope.excludeRuter[$routeParams.ruteId], linjestreng), 1);
        }
        console.log($scope.excludeRuter);
        localStorage.setItem('excludeRuter', angular.toJson($scope.excludeRuter));
      };

      var linjenavn = function(rute) {
        return rute.PublishedLineName + " " + rute.DestinationName;
      };
      $scope.linjenavn = linjenavn;

      function finnRuter(stops) {
        return _.uniq(stops, function(mystop) { return linjenavn(mystop); })
      }

      $scope.refreshRuteDetails = refreshRuteDetails;
      function refreshRuteDetails() {
        RuteInfo.query({ruteId: $routeParams.ruteId}, function(success) {
          $scope.ruteInfo = success;
          $scope.ruter = finnRuter(success);
        }, function(err) { console.log(err); });

      }
    }
]).directive('tidTilNeste', ['$interval', function($interval) {
      return function(scope, element, attrs) {
        var stopTime;
        var updaterate = (attrs.tidTilNeste) ? parseInt(attrs.tidTilNeste, 10) : 30000;


        function updateTidTilNeste() {
          if(!scope.avgang.ExpectedDepartureTime.isAfter()) {
              $interval.cancel(stopTime);
              scope.$parent.ruteInfo.splice(_.indexOf(scope.$parent.ruteInfo, scope.avgang), 1);
            } else {
              element.text(scope.avgang.ExpectedDepartureTime.fromNow());
            }
        }

        // watch value and update if it changes...
        scope.$watch(scope.avgang, function(value) {
          updateTidTilNeste();
        });

        stopTime = $interval(updateTidTilNeste, updaterate);

        element.on('$destroy', function() {
          $interval.cancel(stopTime);
        });

      };
}]);
