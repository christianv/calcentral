/* jshint camelcase: false */
(function(window, angular) {
  'use strict';

  /**
   * Admin controller
   */
  angular.module('calcentral.controllers').controller('AdminController', function(adminFactory, apiService, $scope) {
    /**
     * Store recently acted as users
     */
    var RECENT_USER_LIMIT = 6;
    var RECENT_USER_KEY = 'admin.recentUsers';
    var SAVED_USER_KEY = 'admin.savedUsers';

    $scope.supportsLocalStorage = apiService.util.supportsLocalStorage;

    var getUsers = function(key) {
      var users = localStorage[key];
      return users && JSON.parse(users) || [];
    };

    var users = {};
    users[RECENT_USER_KEY] = getUsers(RECENT_USER_KEY);
    users[SAVED_USER_KEY] = getUsers(SAVED_USER_KEY);

    // Get the UID of the last acted on user
    var lastUser = users[RECENT_USER_KEY][0];

    $scope.admin = {
      actAs: {
        id: parseInt(lastUser && lastUser.enteredID, 10) || ''
      }
    };

    var storeLocal = function(key, data) {
      localStorage[key] = JSON.stringify(data);
    };

    var storeUser = function(user, key) {
      var current = users[key];
      current.unshift(user);
      storeLocal(key, current);
    };

    var clearUser = function(index, key) {
      var current = users[key];
      current.splice(index, 1);
      if (current.length === 0) {
        return localStorage.removeItem(key);
      }
      storeLocal(key, current);
    };

    var clearAllUsers = function(key) {
      users[key].length = 0;
      localStorage.removeItem(key);
    };

    $scope.admin.storeRecentUser = function(user) {
      var current = users[RECENT_USER_KEY];
      if (current[0] && current[0].ldap_uid === user.ldap_uid) {
        return;
      }
      storeUser(user, RECENT_USER_KEY);
      if (current.length > RECENT_USER_LIMIT) {
        current.pop();
        storeLocal(RECENT_USER_KEY, current);
      }
    };

    $scope.admin.storeSavedUser = function(user) {
      var current = users[SAVED_USER_KEY];
      // Don't store user if already stored
      for (var i = 0, len = current.length; i < len; i++) {
        if (current[i].ldap_uid === user.ldap_uid) {
          return;
        }
      }
      storeUser(user, SAVED_USER_KEY);
    };

    $scope.admin.clearSavedUser = function(index) {
      clearUser(index, SAVED_USER_KEY);
    };

    $scope.admin.clearAllSavedUsers = function() {
      clearAllUsers(SAVED_USER_KEY);
    };

    $scope.admin.clearAllRecentUsers = function() {
      clearAllUsers(RECENT_USER_KEY);
    };

    $scope.admin.updateIDField = function(id) {
      $scope.admin.actAs.id = parseInt(id, 10);
    };

    $scope.admin.userBlocks = [
      {
        title: 'Saved Users',
        users: users[SAVED_USER_KEY],
        clearAllUsers: $scope.admin.clearAllSavedUsers,
        clearUser: $scope.admin.clearSavedUser
      },
      {
        title: 'Recent Users',
        users: users[RECENT_USER_KEY],
        clearAllUsers: $scope.admin.clearAllRecentUsers,
        storeUser: $scope.admin.storeSavedUser
      }
    ];

    var redirectToSettings = function() {
      window.location = '/settings';
    };

    /**
     * Lookup user using either UID or SID
     */
    var lookupUser = function(id, callback) {
      adminFactory.userLookup({id: id}).success(function(data) {
        if (data.users.length > 0) {
          return callback(null, data);
        } else {
          return callback('That does not appear to be a valid UID or SID.');
        }
      }).error(function(data) {
        if (data.error) {
          return callback(data.error);
        } else {
          return callback('User search failed.');
        }
      });
    };

    $scope.admin.lookupUser = function() {
      $scope.admin.lookupErrorStatus = '';
      $scope.admin.users = [];
      lookupUser($scope.admin.id, function(err, data) {
        if (err) {
          $scope.admin.lookupErrorStatus = err;
        } else {
          $scope.admin.users = data.users;
        }
      });
    };

    /**
     * Act as another user
     * If 'user' is given, directly act as user.ldap_uid, else act as $scope.admin.actAs.id
     */
    $scope.admin.actAsUser = function(user) {
      $scope.admin.actAsErrorStatus = '';
      $scope.admin.userPool = [];

      if (user && user.ldap_uid) {
        $scope.admin.storeRecentUser(user);
        return adminFactory.actAs({uid: user.ldap_uid}).success(redirectToSettings);
      }

      if (!$scope.admin.actAs || !$scope.admin.actAs.id) {
        return;
      }

      var enteredID = $scope.admin.actAs.id + '';
      lookupUser(enteredID, function(err, data) {
        if (err) {
          $scope.admin.actAsErrorStatus = err;
        } else {
          if (data.users.length > 1) {
            $scope.admin.actAsErrorStatus = 'More than one user was found. Which user did you want to act as?';
            $scope.admin.userPool = data.users;
            return;
          }
          var user = data.users[0];
          user.enteredID = enteredID;
          $scope.admin.storeRecentUser(user);
          adminFactory.actAs({uid: user.ldap_uid}).success(redirectToSettings);
        }
      });
    };

    /**
     * Stop acting as someone else
     */
    $scope.admin.stopActAs = function() {
      adminFactory.stopActAs().success(redirectToSettings).error(redirectToSettings);
    };
  });
})(window, window.angular);
