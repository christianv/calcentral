(function(calcentral) {
  'use strict';

  /**
   * My Classes controller
   */
  calcentral.controller('MyClassesController', ['$http', '$scope', function($http, $scope) {

setTimeout(function(){


    $http.get('/api/my/classes').success(function(data) {
      angular.extend($scope, data);
    });
}, 2000);
  }]);

})(window.calcentral);
