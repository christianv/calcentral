(function(angular) {
  'use strict';

  /**
   * Financial Aid Factory
   */
  angular.module('calcentral.factories').factory('finaidFactory', function(apiService) {
    var url = '/dummy/json/finaid_budget.json';

    var getBudget = function(options) {
      return apiService.http.request(options, url);
    };

    return {
      getBudget: getBudget
    };
  });
}(window.angular));
