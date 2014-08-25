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
        $scope.favoritter = JSON.parse(localStorage.getItem(FAVORITTER));
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


      if (favContains(favoritt) === undefined) {
        console.log("added: " + favoritt);
        $scope.favoritter.push(favoritt);
      } else {
        console.log("removed: " + favoritt);
        $scope.favoritter.splice(_.indexOf($scope.favoritter, favoritt), 1);
      }
      console.log($scope.favoritter);
      localStorage.setItem(FAVORITTER, JSON.stringify($scope.favoritter));
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

      if(!localStorage.getItem('excludeRuter')) {
        $scope.excludeRuter = [];
      } else {
        try {
          $scope.excludeRuter = JSON.parse(localStorage.getItem('excludeRuter'));
        } catch (ex) {
          console.log('failed reading localstorage');
          delete localStorage['excludeRuter'];
          $scope.excludeRuter = [];
        }
      }
      refreshRuteDetails();

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
        localStorage.setItem('excludeRuter', JSON.stringify($scope.excludeRuter));
      };
      var linjenavn = function(rute) {
        return rute.PublishedLineName + " " + rute.DestinationName;
      };

      $scope.refreshRuteDetails = refreshRuteDetails;

      $scope.linjenavn = linjenavn;
      function finnRuter(stops) {
        return _.uniq(stops, function(mystop) { return linjenavn(mystop); })
      };

      function refreshRuteDetails() {
        RuteInfo.query({ruteId: $routeParams.ruteId}, function(success) {
          $scope.ruteInfo = success;
          $scope.ruter = finnRuter(success);
          console.log($scope.ruteInfo);
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
