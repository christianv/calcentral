'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * Financial Aid controller
 */
angular.module('calcentral.controllers').controller('FinaidController', function(apiService, finaidFactory, finaidService, $routeParams, $scope) {
  apiService.util.setTitle('Financial Aid');

  $scope.isMainFinaid = true;
  $scope.finaid = {
    isLoading: true
  };

  /**
   * Set whether you can a user can see the finaid year data
   */
  var setCanSeeFinaidYear = function(data, finaidYear) {
    $scope.canSeeFinaidData = finaidService.canSeeFinaidData(data, finaidYear);
  };

  /**
   * Set the current finaid year
   * If we don't receive a finaid year through the route params, use the default aid year
   */
  var setFinaidYear = function(data, finaidYearId) {
    if (finaidYearId) {
      $scope.finaidYear = finaidService.findFinaidYear(data, finaidYearId);
    } else {
      finaidService.setDefaultFinaidYear(data);
      $scope.finaidYear = _.get(finaidService, 'options.finaidYear');
    }
  };

  /**
   * See whether the finaid year, semester option combination exist, otherwise, send them to the 404 page
   */
  var combinationExists = function(data, finaidYearId, semesterOptionId) {
    var combination = finaidService.combinationExists(data, finaidYearId, semesterOptionId);

    // If no correct finaid year comes back, make sure to send them to the 404 page.
    if (!combination) {
      apiService.util.redirect('404');
      return false;
    }
  };

  /**
   * Get the finaid summary information
   */
  var getFinaidSummary = function(options) {
    return finaidFactory.getSummary(options).success(function(data) {
      setFinaidYear(data.feed, $routeParams.finaidYearId);
      combinationExists(data.feed, _.get($scope, 'finaidYear.id'), $routeParams.semesterOptionId);
      setCanSeeFinaidYear(data.feed, $scope.finaidYear);
      $scope.finaidSummary = data.feed.finaidSummary;
      $scope.finaid.isLoading = false;
    });
  };

  getFinaidSummary();

  /**
   * We need to update the finaid summary when the approvals have changed
   */
  $scope.$on('calcentral.custom.api.finaid.approvals', function() {
    getFinaidSummary({
      refreshCache: true
    });
  });
});
