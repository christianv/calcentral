/**
 * Set the security configuration for CalCentral
 */
(function(angular) {
  'use strict';

  // Set the configuration
  angular.module('calcentral.config').run(function(calcentralConfigFactory, $http) {
    /**
     * Setting up CSRF tokens for POST, PUT and DELETE requests
     * @param {String} token The CSRF Token
     */
    var setToken = function(token) {
      if (token) {
        $http.defaults.headers.post['X-CSRF-Token'] = token;
        $http.defaults.headers.put['X-CSRF-Token'] = token;
      }
    };

    calcentralConfigFactory.getConfig().success(function(data) {
      setToken(data.csrfToken);
    });
  });
})(window.angular);
