(function(angular) {
  'use strict';

  /**
   * Financial Aid Award controller
   */
  angular.module('calcentral.controllers').controller('FinaidAwardController', function(finaidFactory, $scope) {
    var createLabels = function(data) {
      for (var i = 0; i < data.finaidAwards.terms.length; i++) {
        var term = data.finaidAwards.terms[i];
        term.termLabel = term.startTermYear + ' - ' + term.endTermYear;
      }
    };

    var getFinaidAwards = function() {
      finaidFactory.getAwards().success(function(data) {
        createLabels(data);
        angular.extend($scope, data);
        // Select the first term by default
        $scope.term = $scope.finaidAwards.terms[0];
      });
    };

    getFinaidAwards();
  });
})(window.angular);
