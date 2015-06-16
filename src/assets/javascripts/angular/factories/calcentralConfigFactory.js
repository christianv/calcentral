(function(angular) {
  'use strict';

  /**
   * CalCentral Config Factory
   */
  angular.module('calcentral.factories').factory('calcentralConfigFactory', function($http) {
    var url = '/api/config';

    /**
     * Get the CalCentral config
     * Includes
     *   csrf tokens
     *   uid
     *   google analytics id
     *   app version
     *   hostname
     */
    var getConfig = function() {
// TODO use http service
      return $http.get(url, {
        cache: true
      });
    };

    return {
      getConfig: getConfig
    };
  });
}(window.angular));
