'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * Profile Email controller
 */
angular.module('calcentral.controllers').controller('ProfileEmailController', function(profileFactory, $scope, $q) {
  angular.extend($scope, {
    emails: {
      content: [],
      editorEnabled: false
    },
    emailTypes: [],
    currentObject: {},
    isSaving: false
  });
  $scope.contacts = {};

  var emptyObject = {
    type: {
      code: ''
    },
    emailAddress: '',
    primary: false
  };

  var parsePerson = function(data) {
    var person = data.data.feed.person;
    angular.extend($scope, {
      emails: {
        content: person.emails
      }
    });
  };

  var parseEmailTypes = function(data) {
    if (!_.get(data, 'data.feed.xlatvalues.values')) {
      return;
    }
    $scope.emailTypes = data.data.feed.xlatvalues.values;
  };

  var getPerson = profileFactory.getPerson({
    refreshCache: true
  }).then(parsePerson);
  var getEmailTypes = profileFactory.getEmailTypes().then(parseEmailTypes);

  var loadInformation = function() {
    $q.all(getPerson, getEmailTypes).then(function() {
      $scope.isLoading = false;
    });
  };

  var closeEditors = function(broadcast) {
    if (broadcast) {
      $scope.$broadcast('calcentral.custom.api.profile.closeEditors');
    }
    angular.forEach($scope.emails.content, function(item) {
      item.isModifying = false;
    });
  };

  var saveCompleted = function() {
    $scope.isSaving = false;
    $scope.closeEditor();
  };

  $scope.saveEmail = function(email) {
    $scope.isSaving = true;

    profileFactory.postEmail({
      type: email.type.code,
      email: email.emailAddress,
      isPreferred: email.primary ? 'Y' : 'N'
    }).then(saveCompleted);
  };

  var saveAddEmail = function(email) {
    closeEditors(true);
    email.isModifying = true;
    $scope.currentObject = angular.copy(email);
    $scope.emails.editorEnabled = true;
  };

  $scope.addEmail = function() {
    emptyObject.isAdding = true;
    // Select the first item in the dropdown
    emptyObject.type.code = $scope.emailTypes[0].fieldvalue;
    saveAddEmail(emptyObject);
  };

  $scope.editEmail = function(email) {
    saveAddEmail(email);
  };

  $scope.closeEditor = function() {
    closeEditors(true);
    $scope.currentObject = {};
    $scope.emails.editorEnabled = false;
  };

  loadInformation();
});
