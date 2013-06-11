(function(window, calcentral) {
  'use strict';

  /**
   * CalCentral main controller
   */
  calcentral.controller('CalcentralController', ['$route', '$scope', 'apiService', function($route, $scope, apiService) {

    // Expose the API service
    $scope.api = apiService;

    /**
     * Broadcast an API event
     * in order for an API to broadcast events, it need to have an 'events' property
     * @param {String} apiName The name of the event
     * @param {Object} events Events that we should broadcast
     */
    var broadcastApiEvent = function(apiName, events) {
      for (var i in events) {
        if (events.hasOwnProperty(i)) {
          $scope.$broadcast('calcentral.api.' + apiName + '.' + i, events[i]);
        }
      }
    };

    /**
     * Watch the events for a certain part of the API
     * @param {String} apiName The name of the API you want to watch (e.g. user)
     */
    var watchEvents = function(apiName) {
      $scope.$watch('api.' + apiName + '.events', function(events) {
        broadcastApiEvent(apiName, events);
      }, true);
    };

    var fireEvents = function() {
      for (var i in $scope.api) {
        if ($scope.api.hasOwnProperty(i) && $scope.api[i].events) {
          watchEvents(i);
        }
      }
    };

    /**
     * Will be executed on every route change
     *  - Get the user information when it hasn't been loaded yet
     *  - Handle the page access
     *  - Send the right controller name
     */
    $scope.$on('$routeChangeSuccess', function() {
      fireEvents();
      apiService.user.handleRouteChange();
      apiService.util.changeControllerName($route.current.controller);
    });

  }]);

})(window, window.calcentral);
