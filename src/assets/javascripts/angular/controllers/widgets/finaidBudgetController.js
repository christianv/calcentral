(function(angular) {
  'use strict';

  /**
   * Financial Aid Budget controller
   */
  angular.module('calcentral.controllers').controller('FinaidBudgetController', function(finaidFactory, $scope) {
    var getFinaidActivity = function() {
      finaidFactory.getBudget().success(function(data) {
        angular.extend($scope, data);
        $scope.budget = data.finaidBudget.terms[0];
      });
    };

    getFinaidActivity();
  });
})(window.angular);
