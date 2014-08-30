'use strict';

angular.module('raskruteControllers')
    .controller('FavorittCtrl', ['$scope', 'RuteInfo', '$http', '$routeParams', 'StoppID',
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
