(function(angular) {
  'use strict';

  /**
   * L & S Advising controller
   */
  angular.module('calcentral.controllers').controller('LsAdvisingController', function(lsAdvisingFactory, $scope) {

    lsAdvisingFactory.getAdvisingInfo().success(function(data) {
      angular.extend($scope, data);
    });

  });

})(window.angular);
