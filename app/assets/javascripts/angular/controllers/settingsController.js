(function(calcentral) {
  'use strict';

  /**
   * Settings controller
   */
  calcentral.controller('SettingsController', ['$scope', 'apiService', function($scope, apiService) {

    apiService.util.setTitle('Settings');

    var services = ['canvas', 'google'];

    var refreshServices = function(profile) {
      $scope.connected_services = services.filter(function(element) {
        return profile['has_' + element + '_access_token'];
      });
      $scope.non_connected_services = services.filter(function(element) {
        return !profile['has_' + element + '_access_token'];
      });
    };

    $scope.$watch('api.user.profile', function(profile) {
      if (profile) {
        console.log(profile);
        refreshServices(profile);
      }
    }, true);

    $scope.api.user._fetch();

  }]);

})(window.calcentral);
