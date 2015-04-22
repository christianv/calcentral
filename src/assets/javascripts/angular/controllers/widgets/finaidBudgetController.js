

(function(angular) {
  'use strict';

  /**
   * Activity controller
   */
  angular.module('calcentral.controllers').controller('FinaidBudgetController', function(finaidFactory, $scope) {
    var getFinaidActivity = function() {
      finaidFactory.getBudget().success(function(data) {
        angular.extend($scope, data);
      });
    };

    getFinaidActivity();
  });
})(window.angular);
