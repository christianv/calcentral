'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * Emergency controller
 */
angular.module('calcentral.controllers').controller('EmergencyController', function(profileFactory, $scope) {
  $scope.emergencyContactInformation = {
    isLoading: true,
    isErrored: false
  };

  var loadInformation = function() {
    profileFactory.getPerson().then(function(data) {
      $scope.emergencyContactInformation.isLoading = false;
      $scope.emergencyContactInformation.isErrored = _.get(data, 'data.errored');
    });
  };

  loadInformation();
});
