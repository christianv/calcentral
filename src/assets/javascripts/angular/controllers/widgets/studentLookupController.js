/* jshint camelcase: false */
(function(window, angular) {
  'use strict';

  /**
   * Student Lookup controller
   */
  angular.module('calcentral.controllers').controller('StudentLookupController', function(adminFactory, apiService, $scope) {

    $scope.selectOptions = ['Search', 'Saved', 'Recent'];

    $scope.currentSelection = $scope.selectOptions[0];

    $scope.switchSelectedOption = function(selectedOption) {
      $scope.currentSelection = selectedOption;
    };

    $scope.admin = {
      searchedUsers: [],
      storedUsers: []
    };

    var getStoredUsers = function() {
      adminFactory.getStoredUsers()
        .success(function(data) {
          $scope.admin.storedUsers = data.users;
        })
        .error(function(data) {
          console.log('getStoredUsers error');
        });
    };
    getStoredUsers();

    /**
     * Lookup user using either UID or SID
     */
    var lookupUser = function(id) {
      return adminFactory.userLookup({id: id}).then(handleLookupUserSuccess, handleLookupUserError);
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
      return adminFactory.actAs({uid: user.ldap_uid}).success(redirectToSettings);
    };

    /**
     * Stop acting as someone else
     */
    $scope.admin.stopActAs = function() {
      adminFactory.stopActAs().success(redirectToSettings).error(redirectToSettings);
    };
  });
})(window, window.angular);
