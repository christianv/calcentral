'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * Financial Aid - Awards controller
 */
angular.module('calcentral.controllers').controller('FinaidAwardsController', function($scope, finaidFactory, finaidService) {
  var keysGiftWork = ['giftaid', 'workstudy'];
  var keysLoans = ['subsidizedloans', 'unsubsidizedloans', 'alternativeloans', 'plusloans'];

  $scope.finaidAwardsInfo = {
    isLoading: true,
    backToText: 'Financial Aid',
    keysGiftWork: keysGiftWork,
    keysLoans: keysLoans
  };
  $scope.finaidAwards = {};

  /**
   * Check whether an object has any keys with actual values in them
   */
  var checkKeys = function(keys, object) {
    return _.some(keys, _.partial(_.get, object));
  };

  var addColors = function(feed) {
    _.mapValues(feed.awards, function(value, key) {
      if (_.includes(keysLoans, key)) {
        value.color = 'blue-dark';
      } else if (_.includes(keysGiftWork, key)) {
        value.color = 'blue-light';
      }
      return value;
    });

    return feed;
  };

  var parseFeed = function(feed) {
    if (!feed) {
      return;
    }

    // Check whether this student has any awards at all
    // and see whether they have any loans
    var allKeys = keysGiftWork.concat(keysLoans);
    feed.hasAwards = checkKeys(allKeys, feed.awards);
    feed.hasLoans = checkKeys(keysLoans, feed.awards);

    feed = addColors(feed);

    return feed;
  };

  var loadAwards = function() {
    return finaidFactory.getAwards({
      finaidYearId: finaidService.options.finaidYear.id
    }).success(function(data) {
      angular.extend($scope.finaidAwards, parseFeed(data.feed));
      $scope.errored = data.errored;
      $scope.finaidAwardsInfo.isLoading = false;
    });
  };

  $scope.$on('calcentral.custom.api.finaid.finaidYear', loadAwards);
});