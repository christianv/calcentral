(function(angular) {

  'use strict';

  angular.module('calcentral.services').service('onlineService', [
    '$rootScope',
    '$window',
    function(
      $rootScope,
      $window) {

    var events = {};

    var checkOnline = function() {
      events.isOnline = (navigator.onLine === true);
      console.log(events.isOnline);
    };

    checkOnline();
    $window.addEventListener('offline', checkOnline);
    $window.addEventListener('online', checkOnline);

    // Expose methods
    return {
      events: events
    };

  }]);

}(window.angular));
