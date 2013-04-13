(function() {
  'use strict';

  /**
   * Activity controller
   */
  calcentral.controller('LoginController', ['$http', '$scope', function($http, $scope) {

    //$http.defaults.headers.common.Authorization = 'Basic ' + Base64.encode($scope.login.login + ':' + $scope.login.password);

    $scope.login = {};
    $scope.login.user = null;

    $scope.login.connect = function() {
        $http.get('/basic_auth_login').success(function(data, status) {
            if (status < 200 || status >= 300) {
              return;
            }
            $scope.login.user = data;
            window.location = '/';
        });
    };

    $scope.login.disconnect = function() {
        $scope.login.user = null;
    };

    $scope.$watch('login.login + login.password', function() {
        $http.defaults.headers.common.Authorization = 'Basic ' + Base64.encode($scope.login.login + ':' + $scope.login.password);
    });

  }]);

})();
