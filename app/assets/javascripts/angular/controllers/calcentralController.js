(function(window, calcentral) {
  'use strict';

  /**
   * CalCentral main controller
   */
  calcentral.controller('CalcentralController', ['$route', '$scope', 'apiService', function($route, $scope, apiService) {

    /**
     * Will be executed on every route change
     *  - Get the user information when it hasn't been loaded yet
     *  - Handle the page access
     *  - Send the right controller name
     */
    $scope.$on('$routeChangeSuccess', function() {
      apiService.user.handleRouteChange();
      apiService.util.changeControllerName($route.current.controller);
    });

    $scope.api = apiService;

  }]);

})(window, window.calcentral);
