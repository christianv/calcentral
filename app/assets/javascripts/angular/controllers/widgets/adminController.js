/* jshint camelcase: false */
(function(window, angular) {
  'use strict';

  /**
   * Admin controller
   */
  angular.module('calcentral.controllers').controller('AdminController', function(apiService, $http, $scope) {
    /**
     * Store recently entered UIDs
     */
    var RECENT_UID_LIMIT = 6;
    var RECENT_UID_KEY = 'admin.recentUIDs';
    var SAVED_UID_KEY = 'admin.savedUIDs';

    $scope.supportsLocalStorage = apiService.util.supportsLocalStorage;

    var getUIDs = function(key) {
      var UIDs = localStorage[key];
      return UIDs && JSON.parse(UIDs) || [];
    };

    var UIDs = {};
    UIDs[RECENT_UID_KEY] = getUIDs(RECENT_UID_KEY);
    UIDs[SAVED_UID_KEY] = getUIDs(SAVED_UID_KEY);

    var storeLocal = function(key, data) {
      localStorage[key] = JSON.stringify(data);
    };

    var storeUID = function(uid, key) {
      var current = UIDs[key];
      current.unshift(uid);
      storeLocal(key, current);
    };

    var clearUID = function(index, key) {
      var current = UIDs[key];
      current.splice(index, 1);
      if (current.length === 0) {
        return localStorage.removeItem(key);
      }
      storeLocal(key, current);
    };

    var clearAllUIDs = function(key) {
      UIDs[key].length = 0;
      localStorage.removeItem(key);
    };

    $scope.admin = {
      actAs: {
        id: parseInt(UIDs[RECENT_UID_KEY][0], 10) || ''
      }
    };

    // Expose UIDs to view
    $scope.admin.recentUIDs = UIDs[RECENT_UID_KEY];
    $scope.admin.savedUIDs = UIDs[SAVED_UID_KEY];

    $scope.admin.storeRecentUID = function(uid) {
      var current = UIDs[RECENT_UID_KEY];
      if (current[0] === uid) {
        return;
      }
      storeUID(uid, RECENT_UID_KEY);
      if (current.length > RECENT_UID_LIMIT) {
        current.pop();
        storeLocal(RECENT_UID_KEY, current);
      }
    };

    $scope.admin.storeSavedUID = function(uid) {
      var current = UIDs[SAVED_UID_KEY];
      // Only store uid if it isn't already stored
      if (current.indexOf(uid) < 0) {
        storeUID(uid, SAVED_UID_KEY);
      }
    };

    $scope.admin.clearSavedUID = function(index) {
      clearUID(index, SAVED_UID_KEY);
    };

    $scope.admin.clearAllSavedUIDs = function() {
      clearAllUIDs(SAVED_UID_KEY);
    };

    $scope.admin.clearAllRecentUIDs = function() {
      clearAllUIDs(RECENT_UID_KEY);
    };

    $scope.admin.updateUIDField = function(uid) {
      $scope.admin.actAs.id = parseInt(uid, 10);
    };

    $scope.admin.uidDivs = [
      {
        title: 'Saved UIDs',
        UIDs: $scope.admin.savedUIDs,
        updateUIDField: $scope.admin.updateUIDField,
        clearAllUIDs: $scope.admin.clearAllSavedUIDs,
        clearUID: $scope.admin.clearSavedUID
      },
      {
        title: 'Recent UIDs',
        UIDs: $scope.admin.recentUIDs,
        updateUIDField: $scope.admin.updateUIDField,
        clearAllUIDs: $scope.admin.clearAllRecentUIDs,
        storeUID: $scope.admin.storeSavedUID
      }
    ];

    var redirectToSettings = function() {
      window.location = '/settings';
    };

    /**
     * Lookup person using either UID or SID
     */
    var lookupPerson = function(id, callback) {
      var lookupUri = '/api/search_users/' + id;
      $http.get(lookupUri).success(function(data) {
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

    var resetUserSearch = function() {
      $scope.admin.users = [];
      $scope.admin.lookupErrorStatus = '';
      $scope.admin.id = '';
    };

    $scope.admin.uidToSidLookup = function() {
      var studentId = $scope.admin.id;
      resetUserSearch();
      lookupPerson(studentId, function(err, data) {
        if (err) {
          $scope.admin.lookupErrorStatus = err;
        } else {
          $scope.admin.users = data.users;
        }
      });
    };

    /**
     * Act as someone else
     */
    $scope.admin.actAsSomeone = function(uid) {
      $scope.admin.actAsErrorStatus = '';
      $scope.admin.userPool = [];
      if (uid) {
        var user = { uid: uid + '' };
        $scope.admin.storeRecentUID(uid);
        return $http.post('/act_as', user).success(redirectToSettings);
      }
      if (!$scope.admin.actAs || !$scope.admin.actAs.id) {
        return;
      }
      var id = $scope.admin.actAs.id + '';
      lookupPerson(id, function(err, data) {
        if (err) {
          $scope.admin.actAsErrorStatus = err;
        } else {
          if (data.users.length > 1) {
            $scope.admin.actAsErrorStatus = 'More than one user was found. Which user did you want to act as?';
            $scope.admin.userPool = data.users;
            return;
          }
          var user = { uid: data.users[0].ldap_uid };
          $scope.admin.storeRecentUID(id);
          $http.post('/act_as', user).success(redirectToSettings);
        }
      });
    };

    /**
     * Stop acting as someone else
     */
    $scope.admin.stopActAs = function() {
      $http.post('/stop_act_as').success(redirectToSettings).error(redirectToSettings);
    };
  });
})(window, window.angular);
