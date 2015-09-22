'use strict';

var angular = require('angular');

/**
 * SIR Factory
 */
angular.module('calcentral.factories').factory('sirFactory', function(apiService, $http) {
  var urlChecklist = '/api/campus_solutions/checklist';
  var urlDeposit = '/api/campus_solutions/deposit';
  var urlSirConfig = '/api/campus_solutions/sir_config';
  var urlSirResponse = '/api/campus_solutions/sir_response';

  var getChecklist = function(options) {
    return apiService.http.request(options, urlChecklist);
  };
  var getDeposit = function(options) {
    return apiService.http.request(options, urlDeposit);
  };
  var getSirConfig = function(options) {
    return apiService.http.request(options, urlSirConfig);
  };

  var postSirResponse = function(params) {
    return $http.post(urlSirResponse, params);
  };

  return {
    getChecklist: getChecklist,
    getDeposit: getDeposit,
    getSirConfig: getSirConfig,
    postSirResponse: postSirResponse
  };
});
