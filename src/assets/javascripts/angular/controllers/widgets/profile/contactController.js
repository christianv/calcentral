'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * Contact controller
 */
angular.module('calcentral.controllers').controller('ContactController', function(profileFactory, $scope) {
  $scope.contactInformation = {
    isLoading: true,
    isErrored: false
  };

  var loadInformation = function() {
    profileFactory.getPerson().then(function(data) {
      $scope.contactInformation.isLoading = false;
      $scope.contactInformation.isErrored = _.get(data, 'data.errored');
    });
  };

  loadInformation();
});
