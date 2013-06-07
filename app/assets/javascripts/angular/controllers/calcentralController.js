(function(window, calcentral) {
  'use strict';

  /**
   * CalCentral main controller
   */
  calcentral.controller('CalcentralController', ['$http', '$location', '$route', '$scope', 'apiService', function($http, $location, $route, $scope, apiService) {

    /**
     * Will be executed on every route change
     *  - Get the user information when it hasn't been loaded yet
     *  - Handle the page access
     *  - Send the right controller name
     */
    $scope.$on('$routeChangeSuccess', function() {
      if(!$scope.user.profile) {
        $scope.user._fetch();
      } else {
        $scope.user._handleAccessToPage();
      }
      // Pass in controller name so we can set active location in menu
      $scope.controller_name = $route.current.controller;
    });

    $scope.api = apiService;

  }]);

})(window, window.calcentral);
