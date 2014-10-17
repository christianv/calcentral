/* jshint camelcase: false */
(function(window, angular) {
  'use strict';

  /**
   * Admin controller
   */
  angular.module('calcentral.controllers').controller('AdminController', function(adminFactory, apiService, $scope, $q) {
    /**
     * Store recently acted as users
     */
    var RECENT_USER_LIMIT = 6;
    var RECENT_USER_KEY = 'admin.recentUIDs';
    var SAVED_USER_KEY = 'admin.savedUIDs';

    $scope.supportsLocalStorage = apiService.util.supportsLocalStorage;

    // Get ldap user objects for all stored UIDs
    var getUsers = function(key) {
      var d = $q.defer();
      var uids = localStorage[key] && JSON.parse(localStorage[key]) || [];
      var requests = [];
      for (var i = 0, len = uids.length; i < len; i++) {
        requests.push(adminFactory.userLookupByUid({id: uids[i]}));
      }
      $q.all(requests).then(function(data) {
        d.resolve(data);
      });
      return d.promise;
    };

    var users = {};
    $scope.admin = {
      actAs: {
        id: ''
      }
    };

    users[RECENT_USER_KEY] = [];
    users[SAVED_USER_KEY] = [];

    var getRecent = getUsers(RECENT_USER_KEY);
    var getSaved = getUsers(SAVED_USER_KEY);

    $q.all([getRecent, getSaved]).then(function(data) {
      var userPool = {};
      userPool[RECENT_USER_KEY] = data[0];
      userPool[SAVED_USER_KEY] = data[1];
      for (var key in userPool) {
        if (userPool.hasOwnProperty(key)) {
          for (var i = 0, len = userPool[key].length; i < len; i++) {
            var user = userPool[key][i].data.users[0];
            if (user) {
              users[key].push(user);
            }
          }
        }
      }
      var lastUser = users[RECENT_USER_KEY][0];
      // Display the last acted as UID in the input box
      $scope.admin.actAs.id = parseInt(lastUser && lastUser.ldap_uid, 10) || '';
    });

    // Strips all user information except for UID
    var removeSensitive = function(data) {
      if (!(data instanceof Array)) {
        return data;
      }
      var uids = [];
      for (var i = 0, len = data.length; i < len; i++) {
        if (data[i] && data[i].ldap_uid) {
          uids.push(data[i].ldap_uid);
        }
      }
      return uids;
    };

    var storeLocal = function(key, data) {
      localStorage[key] = JSON.stringify(removeSensitive(data));
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
    var lookupUser = function(id) {
      var d = $q.defer();

      adminFactory.userLookup({id: id}).success(function(data) {
        if (data.users.length > 0) {
          d.resolve(data);
        } else {
          d.reject('That does not appear to be a valid UID or SID.');
        }
      }).error(function(data) {
        if (data.error) {
          return d.reject(data.error);
        } else {
          return d.reject('User search failed.');
        }
      });

      return d.promise;
    };

    $scope.admin.lookupUser = function() {
      $scope.admin.lookupErrorStatus = '';
      $scope.admin.users = [];
      lookupUser($scope.admin.id).then(function(data) {
        $scope.admin.users = data.users;
      }, function(err) {
        $scope.admin.lookupErrorStatus = err;
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

      lookupUser($scope.admin.actAs.id + '').then(function(data) {
        if (data.users.length > 1) {
          $scope.admin.actAsErrorStatus = 'More than one user was found. Which user did you want to act as?';
          $scope.admin.userPool = data.users;
          return;
        }
        var user = data.users[0];
        $scope.admin.storeRecentUser(user);
        adminFactory.actAs({uid: user.ldap_uid}).success(redirectToSettings);
      }, function(err) {
        $scope.admin.actAsErrorStatus = err;
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
