/* jshint camelcase: false */
(function(window, angular) {
  'use strict';

  /**
   * Student Lookup controller
   */
  angular.module('calcentral.controllers').controller('StudentLookupController', function(adminFactory, apiService, $scope) {

    $scope.selectOptions = ['Search', 'Saved', 'Recent'];
    $scope.showUsersLimit = 2;
    $scope.showSavedLimit = $scope.showUsersLimit;
    $scope.showRecentLimit = $scope.showUsersLimit;
    var CURRENT_SELECTION_KEY = 'cc-admin-currentSelection';
    var LAST_QUERY_KEY = 'cc-admin-lastQuery';

    console.log($scope.showSavedLimit);
    $scope.$watch('showSavedLimit', function(a, b) {
      console.log('a', a);
      console.log('b', b);
    })

    /**
     * Retrieve the last selected tab from localStorage, or default to 'Search'
     */
    var getCurrentSelection = function() {
      if (apiService.util.supportsLocalStorage) {
        return localStorage.getItem(CURRENT_SELECTION_KEY) || $scope.selectOptions[0];
      }
      return $scope.selectOptions[0];
    };

    /**
     * Retrieve the last searched query from localStorage, or default to ''
     */
    var getLastQuery = function() {
      if (apiService.util.supportsLocalStorage) {
        return localStorage.getItem(LAST_QUERY_KEY) || '';
      }
      return '';
    };

    $scope.admin = {
      currentSelection: getCurrentSelection(),
      query: parseInt(getLastQuery()),
      searchedUsers: [],
      storedUsers: {},
      savedUsersError: 'No saved users yet.',
      recentUsersError: 'No recently viewed users yet.',
    };

    $scope.admin.switchSelectedOption = function(selectedOption) {
      $scope.admin.currentSelection = selectedOption;
      if (apiService.util.supportsLocalStorage) {
        localStorage.setItem(CURRENT_SELECTION_KEY, selectedOption);
      }
    };

    /**
     * Get stored recent/saved users
     */
    var getStoredUsers = function(options) {
      adminFactory.getStoredUsers(options)
        .success(function(data) {
          $scope.admin.storedUsers = data.users;
          // Make sure the searched users have the latest save state
          checkIfSaved($scope.admin.searchedUsers);
        })
        .error(function() {
          var err = 'There was a problem fetching your items.';
          $scope.admin.savedUsersError = err;
          $scope.admin.recentUsersError = err;
        });
    };
    getStoredUsers();

    var getStoredUsersUncached = function() {
      getStoredUsers({
        refreshCache: true
      });
    };

    /**
     * Store recent/saved user
     */
    $scope.admin.storeRecentUser = function(user) {
      // Make sure the most recently viewed user is at the top of the list
      $scope.admin.deleteRecentUser(user).success(function() {
        adminFactory.storeUser({
          uid: user.ldap_uid
        }, 'recent');
      });
    };

    $scope.admin.storeSavedUser = function(user) {
      adminFactory.storeUser({
        uid: user.ldap_uid
      }, 'saved').success(getStoredUsersUncached);
    };

    /**
     * Delete recent/saved user
     */
    $scope.admin.deleteRecentUser = function(user) {
      return adminFactory.deleteUser({
        uid: user.ldap_uid
      }, 'recent').success(getStoredUsersUncached);
    };

    $scope.admin.deleteSavedUser = function(user) {
      adminFactory.deleteUser({
        uid: user.ldap_uid
      }, 'saved').success(getStoredUsersUncached);
    };

    /**
     * Used by 'Search' tab to toggle save state of user
     */
    $scope.admin.toggleSaveState = function(user) {
      if (user.saved) {
        $scope.admin.deleteSavedUser(user);
      } else {
        $scope.admin.storeSavedUser(user);
      }
      user.saved = !user.saved;
    };

    /**
     * Lookup user using either UID or SID
     */
    var lookupUser = function(id) {
      return adminFactory.userLookup({
        id: id
      }).then(handleLookupUserSuccess, handleLookupUserError);
    };

    var handleLookupUserSuccess = function(data) {
      var response = {};
      var users = data.data.users;
      if (users.length > 0) {
        response.users = users;
      } else {
        response.error = 'That does not appear to be a valid UID or SID.';
      }
      return response;
    };

    var handleLookupUserError = function(data) {
      var response = {};
      if (data.error) {
        response.error = data.error;
      } else {
        response.error = 'There was a problem searching for that user.';
      }
      return response;
    };

    $scope.admin.lookupUser = function() {
      $scope.admin.lookupErrorStatus = '';
      $scope.admin.searchedUsers = [];

      lookupUser($scope.admin.query + '').then(function(response) {
        if (apiService.util.supportsLocalStorage) {
          localStorage.setItem(LAST_QUERY_KEY, $scope.admin.query);
        }
        if (response.error) {
          $scope.admin.lookupErrorStatus = response.error;
        } else {
          $scope.admin.searchedUsers = checkIfSaved(response.users);
        }
      });
    };

    /**
     * Mark users as 'saved' if they are stored
     */
    var checkIfSaved = function(users) {
      var savedUsers = $scope.admin.storedUsers.saved;
      for (var i = 0; i < users.length; i++) {
        users[i].saved = false;
        for (var j = 0; j < savedUsers.length; j++) {
          if (users[i].ldap_uid === savedUsers[j].ldap_uid) {
            users[i].saved = true;
            break;
          }
        }
      }
      return users;
    };

    var titleCase = function(str) {
      return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    };

    /**
     * Convert user.last_name to title case since LDAP returns last names fully capitalized
     */
    $scope.admin.titleCaseName = function(user) {
      return user.first_name + ' ' + titleCase(user.last_name);
    };

    var redirectToSettings = function() {
      window.location = '/settings';
    };

    /**
     * Act as another user
     */
    $scope.admin.actAsUser = function(user) {
      $scope.admin.storeRecentUser(user);
      return adminFactory.actAs({
        uid: user.ldap_uid
      }).success(redirectToSettings);
    };

    /**
     * Stop acting as someone else
     */
    $scope.admin.stopActAs = function() {
      adminFactory.stopActAs().success(redirectToSettings).error(redirectToSettings);
    };
  });
})(window, window.angular);
