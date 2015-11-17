'use strict';

var _ = require('lodash');
var angular = require('angular');

angular.module('calcentral.services').service('finaidService', function($rootScope) {
  var options = {
    finaidYear: false
  };

  var findFinaidYear = function(data, finaidYearId) {
    return _.find(data.finaidSummary.finaidYears, function(finaidYear) {
      return finaidYear.id === finaidYearId;
    });
  };

  /**
   * Check whether a student can see the finaid information for a specific aid year
   */
  var canSeeFinaidData = function(data, finaidYear) {
    if (!data || !data.finaidSummary || !finaidYear) {
      return false;
    }

    if (data &&
      data.finaidSummary &&
      data.finaidSummary.finaidYears &&
      data.finaidSummary.title4) {
      return finaidYear &&
        finaidYear.termsAndConditions &&
        finaidYear.termsAndConditions.approved &&
        data.finaidSummary.title4.approved !== null;
    }
    return false;
  };

  /**
   * See whether the finaid year option combination exists
   * @param {Object} data Summary data
   * @param {String} finaidYearId e.g. 2015
   */
  var combinationExists = function(data, finaidYearId) {
    return !!findFinaidYear(data, finaidYearId);
  };

  /**
   * Find the aid year which has the default=true attribute
   */
  var findDefaultFinaidYear = function(finaidYears) {
    return _.find(finaidYears, function(finaidYear) {
      return finaidYear.default;
    });
  };

  /**
   * Set the default Finaid year
   */
  var setDefaultFinaidYear = function(data, finaidYearId) {
    if (data && data.finaidSummary && data.finaidSummary.finaidYears) {
      if (finaidYearId) {
        setFinaidYear(findFinaidYear(data, finaidYearId));
      } else {
        // If no aid year has been selected before, select the default one
        var finaidYear = findDefaultFinaidYear(data.finaidSummary.finaidYears);

        // If no default is found, use the first one
        if (!finaidYear) {
          finaidYear = data.finaidSummary.finaidYears[0];
        }

        setFinaidYear(finaidYear);
      }
    }
    return options.finaidYear;
  };

  var setFinaidYear = function(finaidYear) {
    options.finaidYear = finaidYear;
    $rootScope.$broadcast('calcentral.custom.api.finaid.finaidYear');
  };

  // Expose the methods
  return {
    canSeeFinaidData: canSeeFinaidData,
    combinationExists: combinationExists,
    findFinaidYear: findFinaidYear,
    options: options,
    setDefaultFinaidYear: setDefaultFinaidYear,
    setFinaidYear: setFinaidYear
  };
});
