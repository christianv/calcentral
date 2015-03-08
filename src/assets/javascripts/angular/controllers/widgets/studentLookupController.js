/* jshint camelcase: false */
(function(window, angular) {
  'use strict';

  /**
   * Student Lookup controller
   */
  angular.module('calcentral.controllers').controller('StudentLookupController', function(adminFactory, apiService, $scope) {

    $scope.selectOptions = ['Search', 'Saved', 'Recent'];
    var CURRENT_SELECTION_KEY = 'admin.currentSelection';

    var getCurrentSelection = function() {
      if (apiService.util.supportsLocalStorage) {
        var selection = localStorage.getItem(CURRENT_SELECTION_KEY);
        return selection ? selection : $scope.selectOptions[0];
      }
      return $scope.selectOptions[0];
    };

    $scope.currentSelection = getCurrentSelection();

    $scope.switchSelectedOption = function(selectedOption) {
      $scope.currentSelection = selectedOption;
      if (apiService.util.supportsLocalStorage) {
        localStorage.setItem(CURRENT_SELECTION_KEY, selectedOption);
      }
    };

    $scope.admin = {
      searchedUsers: [],
      storedUsers: [],
      savedUsersError: 'No saved items yet.', // Change to 'No saved users yet.' ?
      recentUsersError: 'No recent items yet.' // Change to 'No recently viewed users yet.' ?
    };

    /**
     * Get stored recent/saved users
     */
    var getStoredUsers = function(options) {
      adminFactory.getStoredUsers(options)
        .success(function(data) {
          $scope.admin.storedUsers = data.users;
        })
        .error(function() {
          var err = 'There was a problem fetching your items.';
          $scope.admin.savedUsersError = err;
          $scope.admin.recentUsersError = err;
        });
    };
    getStoredUsers();

    /**
     * Store recent/saved user
     */
    $scope.admin.storeRecentUser = function(user) {
      // Make sure the most recently viewed user is at the top of the list
      $scope.admin.deleteRecentUser(user).success(function() {
        adminFactory.storeUser({ uid: user.ldap_uid }, 'recent');
      });
    };

    $scope.admin.storeSavedUser = function(user) {
      adminFactory.storeUser({ uid: user.ldap_uid }, 'saved').success(function() {
        getStoredUsers({ refreshCache: true });
      });
    };

    /**
     * Delete recent/saved user
     */
    $scope.admin.deleteRecentUser = function(user) {
      return adminFactory.deleteUser({ uid: user.ldap_uid }, 'recent');
    };

    $scope.admin.deleteSavedUser = function(user) {
      adminFactory.deleteUser({ uid: user.ldap_uid }, 'saved');
    };

    /**
     * Lookup user using either UID or SID
     */
    var lookupUser = function(id) {
      return adminFactory.userLookup({ id: id }).then(handleLookupUserSuccess, handleLookupUserError);
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
        if (response.error) {
          $scope.admin.lookupErrorStatus = response.error;
        } else {
          $scope.admin.searchedUsers = response.users;
        }
      });
    };

    var titleCase = function(str) {
      return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    };

    $scope.admin.titleCaseName = function(user) {
      return titleCase(user.first_name) + ' ' + titleCase(user.last_name);
    };

    var redirectToSettings = function() {
      window.location = '/settings';
    };

    /**
     * Act as another user
     */
    $scope.admin.actAsUser = function(user) {
      $scope.admin.storeRecentUser(user);
      return adminFactory.actAs({ uid: user.ldap_uid }).success(redirectToSettings);
    };

    /**
     * Stop acting as someone else
     */
    $scope.admin.stopActAs = function() {
      adminFactory.stopActAs().success(redirectToSettings).error(redirectToSettings);
    };
  });
})(window, window.angular);
