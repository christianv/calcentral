'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * Finaid Summary controller
 */
angular.module('calcentral.controllers').controller('FinaidSummaryController', function(finaidFactory, finaidService, $location, $route, $routeParams, $scope) {
  // Keep a list of all the selected properties
  angular.extend($scope, {
    // Keep a list of all the selected properties
    selected: {},
    finaidSummaryInfo: {
      isLoadingOptions: true,
      isLoadingData: true
    },
    finaidSummaryData: {},
    shoppingSheet: {}
  });

  /**
   * Update whether you can see the current finaid data or not
   */
  var updateCanSeeFinaid = function() {
    $scope.canSeeFinaidData =
      $scope.selected.finaidYear.termsAndConditions.approved &&
      $scope.finaidSummary.title4.approved !== null;
  };

  /**
   * Set the default selections on the finaid year
   */
  var setDefaultSelections = function(data) {
    if (!_.get(data, 'finaidSummary.finaidYears.length')) {
      return;
    }
    finaidService.setDefaultFinaidYear(data, $routeParams.finaidYearId);
    updateCanSeeFinaid();
    selectFinaidYear();
    updateFinaidUrl();
  };

  var updateFinaidUrl = function() {
    if (!$scope.selected.finaidYear) {
      return;
    }
    $scope.finaidUrl = 'finances/finaid/' + $scope.selected.finaidYear.id;

    if ($scope.isMainFinaid) {
      $location.path($scope.finaidUrl, false);
    }
  };

  var parseFinaidYearData = function(data) {
    angular.extend($scope.finaidSummaryData, data.feed.financialAidSummary);
    angular.extend($scope.shoppingSheet, data.feed.shoppingSheet);
    $scope.errored = data.errored;
    $scope.finaidSummaryInfo.isLoadingData = false;
  };

  var getFinaidYearData = function() {
    if (!$scope.canSeeFinaidData) {
      return;
    }
    return finaidFactory.getFinaidYearInfo({
      finaidYearId: finaidService.options.finaidYear.id
    }).success(parseFinaidYearData);
  };

  var selectFinaidYear = function() {
    $scope.selected.finaidYear = finaidService.options.finaidYear;
    getFinaidYearData();
  };

  $scope.$on('calcentral.custom.api.finaid.finaidYear', selectFinaidYear);

  /**
   * Update the finaid year selection
   */
  $scope.updateFinaidYear = function() {
    finaidService.setFinaidYear($scope.selected.finaidYear);
    updateFinaidUrl();
    updateCanSeeFinaid();
  };

  /**
   * Get the financial aid summary information
   */
  var getFinaidSummary = function() {
    finaidFactory.getSummary().success(function(data) {
      angular.extend($scope, data.feed);
      setDefaultSelections(data.feed);
      $scope.finaidSummaryInfo.isLoadingOptions = false;
    });
  };

  getFinaidSummary();
});
