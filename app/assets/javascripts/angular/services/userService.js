(function(window) {
  /*global calcentral*/
  'use strict';

  /**
   * User service
   */
  calcentral.factory('UserService', ['$http', function($http) {

    var user = {};

    user.isAuthenticated = function() {
      return (user.profile && user.profile.is_logged_in);
    };

    user.signOut = function() {
      window.location = '/logout';
    };

    user.signIn = function() {
      window.location = '/login';
    };

    $http.get('/api/my/status').success(function(data) {
      user.profile = data;
    });

    return user;

  }]);

})(window);
