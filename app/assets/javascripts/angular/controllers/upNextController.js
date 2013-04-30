(function(calcentral) {
  'use strict';

  /**
   * My Up Next controller
   */
  calcentral.controller('UpNextController', ['$http', '$scope', function($http, $scope) {

    setTimeout(function() {

      $http.get('/api/my/up_next').success(function(data) {
        console.log($scope._is_loading);
        angular.extend($scope, data);
        console.log($scope._is_loading);
      });

    }, 2500);

  }]);

})(window.calcentral);
