'use strict';

angular.module('raskruteControllers')
    .controller('HomeCtrl', ['$scope', 'Stopp', '$http', '$routeParams',
  function ($scope, Stopp, $http, $routeParams) {
    function filterStops (stops) {
      return stops.filter(function(value, index, list) {
        return value.Type === STOPPTYPE;
      });

    }

    $scope.snapOpts = {
      disable: 'right'
    };
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