/**
 * Configuration to inject calcentralConfig on every route
 */
(function(angular) {
  'use strict';

  // Set the configuration
  angular.module('calcentral.config').config(function($routeProvider) {
    var originalWhen = $routeProvider.when;

    $routeProvider.when = function(path, route) {
      route.resolve = route.resolve || {};
      angular.extend(route.resolve, {
        'calcentralConfig': function(calcentralConfigFactory) {
          return calcentralConfigFactory.getConfig().then(function(response) {
            return response.data;
          });
        }
      });

      return originalWhen.call($routeProvider, path, route);
    };
  });
})(window.angular);
