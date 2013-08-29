(function(angular) {

  'use strict';

  angular.module('calcentral.services').service('apiService', [
    'analyticsService',
    'authService',
    'apiEventService',
    'controllerLoadedService',
    'dateService',
    'errorService',
    'popoverService',
    'refreshService',
    'userService',
    'utilService',
    'widgetService',
    function(
      analyticsService,
      authService,
      apiEventService,
      controllerLoadedService,
      dateService,
      errorService,
      popoverService,
      refreshService,
      userService,
      utilService,
      widgetService) {

    // API
    var api = {
      analytics: analyticsService,
      auth: authService,
      controllerLoaded: controllerLoadedService,
      events: apiEventService,
      date: dateService,
      error: errorService,
      popover: popoverService,
      refresh: refreshService,
      user: userService,
      util: utilService,
      widget: widgetService
    };

    return api;

  }]);

}(window.angular));
