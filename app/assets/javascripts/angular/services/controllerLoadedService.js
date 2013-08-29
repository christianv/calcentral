(function(angular) {

  'use strict';

  /**
   * Controller loaded service
   */
  angular.module('calcentral.services').service('controllerLoadedService', ['$rootScope', function($rootScope) {

    var controllers = {};

    console.log(2);

    var add = function(controllerName) {
      console.log(controllerName);
      controllers[controllerName] = true;
    };

    var hasLoaded = function(controllerName) {
      console.log(!!controllers[controllerName])
      return !!controllers[controllerName];
    };

    // Expose methods
    return {
      add: add,
      hasLoaded: hasLoaded
    };

  }]);

}(window.angular));
