(function () {
  'use strict';

  angular.module('raskruteControllers')
      .controller('RuteDetailCtrl', ['$scope', 'RuteInfo', '$http', '$routeParams', 'StoppID',
        function ($scope, RuteInfo, $http, $routeParams, StoppID) {

          try {
            var ruter = angular.fromJson(localStorage.getItem('excludeRuter'));
            if (Array.isArray(ruter)) {
              throw new Error('is array, old delete it!');
            }

            if (!ruter.hasOwnProperty($routeParams.ruteId)) {
              ruter[$routeParams.ruteId] = [];
            }
            $scope.excludeRuter = ruter;
          } catch (ex) {
            console.log('failed reading localstorage');
            delete localStorage.excludeRuter;
            var ruter = {};
            ruter[$routeParams.ruteId] = [];
            $scope.excludeRuter = ruter;
          }
          refreshRuteDetails();

          var isRuteExcluded = function (rute) {
            if (!$scope.excludeRuter.hasOwnProperty($routeParams.ruteId)) {
              return true;
            }
            return $scope.excludeRuter[$routeParams.ruteId].indexOf(linjenavn(rute)) === -1;
          };
          $scope.ruteFilter = isRuteExcluded;

          $scope.toggleFilter = function (rute) {
            var linjestreng = linjenavn(rute);
            if (isRuteExcluded(rute)) {
              $scope.excludeRuter[$routeParams.ruteId].push(linjestreng);
            } else {
              $scope.excludeRuter[$routeParams.ruteId].splice(_.indexOf($scope.excludeRuter[$routeParams.ruteId], linjestreng), 1);
            }
            console.log($scope.excludeRuter);
            localStorage.setItem('excludeRuter', angular.toJson($scope.excludeRuter));
          };

          var linjenavn = function (rute) {
            return rute.PublishedLineName + " " + rute.DestinationName;
          };
          $scope.linjenavn = linjenavn;

          function finnRuter(stops) {
            return _.uniq(stops, function (mystop) {
              return linjenavn(mystop);
            });
          }

          $scope.refreshRuteDetails = refreshRuteDetails;
          function refreshRuteDetails() {
            $scope.isReloading = true;
            RuteInfo.query({ruteId: $routeParams.ruteId}, function (success) {
              $scope.ruteInfo = success;
              $scope.isReloading = false;
              $scope.ruter = finnRuter(success);
            }, function (err) {
              $scope.isReloading = false;
              console.log(err);
            });

          }
        }
      ]).directive('tidTilNeste', ['$interval', function ($interval) {
        return function (scope, element, attrs) {
          var stopTime;
          var updaterate = (attrs.tidTilNeste) ? parseInt(attrs.tidTilNeste, 10) : 30000;


          function updateTidTilNeste() {
            if (!scope.avgang.ExpectedDepartureTime.isAfter()) {
              $interval.cancel(stopTime);
              scope.$parent.ruteInfo.splice(_.indexOf(scope.$parent.ruteInfo, scope.avgang), 1);
            } else {
              element.text(scope.avgang.ExpectedDepartureTime.fromNow());
            }
          }

          // watch value and update if it changes...
          scope.$watch(scope.avgang, function (value) {
            updateTidTilNeste();
          });

          stopTime = $interval(updateTidTilNeste, updaterate);

          element.on('$destroy', function () {
            $interval.cancel(stopTime);
          });

        };
      }]);
})();