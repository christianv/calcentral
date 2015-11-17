'use strict';

var angular = require('angular');

/**
 * Finaid COA (Cost of Attendance) controller
 */
angular.module('calcentral.controllers').controller('FinaidCoaController', function($scope, finaidFactory, finaidService) {
  var views = ['fullYear', 'semester'];
  $scope.coa = {
    isLoading: true,
    // TODO make this views[0] as soon as fullYear is available
    currentView: views[1]
  };

  /**
   * Toggle between the semester & year view
   */
  $scope.toggleView = function() {
    if ($scope.coa.currentView === views[0]) {
      $scope.coa.currentView = views[1];
    } else {
      $scope.coa.currentView = views[0];
    }
  };

  var loadCoa = function() {
    return finaidFactory.getFinaidYearInfo({
      finaidYearId: finaidService.options.finaidYear.id
    }).success(function(data) {
      angular.extend($scope.coa, data.feed.coa);
      $scope.errored = data.errored;
      $scope.coa.isLoading = false;
    });
  };

  $scope.$on('calcentral.custom.api.finaid.finaidYear', loadCoa);
});
