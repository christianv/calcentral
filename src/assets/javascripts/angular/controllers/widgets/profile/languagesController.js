'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * Languages controller
 */
angular.module('calcentral.controllers').controller('LanguagesController', function(profileFactory, $scope) {
  $scope.languagesInformation = {
    isLoading: true,
    isErrored: false
  };

  var loadInformation = function() {
    profileFactory.getPerson().then(function(data) {
      $scope.languagesInformation.isLoading = false;
      $scope.languagesInformation.isErrored = _.get(data, 'data.errored');
    });
  };

  loadInformation();
});
