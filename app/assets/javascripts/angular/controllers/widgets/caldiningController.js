(function(angular) {
  'use strict';

  /**
   * Cal Dining controller
   */
  angular.module('calcentral.controllers').controller('CaldiningController', function(caldiningFactory, $interval, $scope) {

    var currentPosition = '';

    //////////////////
    ///
    ///
    //////////////////

    var getDistanceFromLatLonInMiles = function(lat1, lon1, lat2, lon2) {
      var R = 6371;
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1);
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var distanceKm = R * c;
      var distanceMiles = distanceKm * 0.621371;
      var distanceMilesRound = Math.round(distanceMiles * 1000) / 1000;
      return distanceMilesRound;
    };

    var deg2rad = function(deg) {
      return deg * (Math.PI/180);
    };

    //////////////////
    ///
    ///
    //////////////////

    var calculateDistance = function(pos1, pos2) {
      return getDistanceFromLatLonInMiles(pos1.lat, pos1.long, pos2.lat, pos2.long);
    };

    var calculateDistances = function() {
      if (!$scope.locations || !currentPosition) {
        return;
      }

      for (var i = 0; i < $scope.locations.length; i++) {
        $scope.locations[i].distance = calculateDistance(currentPosition, $scope.locations[i].location);
      }
    };

    var updateLocation = function(position) {
      var newPosition = {
        lat: position.coords.latitude,
        long: position.coords.longitude
      };

      if (!currentPosition || (currentPosition.lat !== newPosition.lat && currentPosition.long !== newPosition.long)) {
        currentPosition = newPosition;
        calculateDistances();
      }
    };

    var loadCheckLocation = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateLocation);
      }
    };
    var getCaldining = function(options) {
      caldiningFactory.getCaldining(options).success(function(data) {
        angular.extend($scope, data);
        $interval(loadCheckLocation, 4000);
      });
    };

    getCaldining();
  }).filter('filterFoodItems', function() {
    return function(items, search) {
      var result = {};
      angular.forEach(items, function(value, key) {
        if (search && search.vegan && value.vegan) {
          result[key] = value;
        } else if (search && search.vegetarian && value.vegetarian) {
          result[key] = value;
        }
        if (!search || (!search.vegan && !search.vegetarian)) {
          result[key] = value;
        }
      });
      return result;
    };
  });
})(window.angular);
