(function(angular) {
  'use strict';

  angular.module('calcentral.factories').factory('caldiningFactory', function(apiService) {
    var url = '/dummy/json/caldining.json';

    var getCaldining = function(options) {
      return apiService.http.request(options, url);
    };

    return {
      getCaldining: getCaldining
    };
  });
}(window.angular));
