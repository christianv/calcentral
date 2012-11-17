(function() {
  /*global calcentral*/
  'use strict';

  /**
   * Dashboard controller
   */
  calcentral.controller('DashboardController', ['$rootScope', 'UserService', function($rootScope, UserService) {

    $rootScope.title = 'Dashboard | CalCentral';

    $rootScope.user = UserService;
    console.log($rootScope.user.isAuthenticated());

  }]);

})();
