'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * SIR (Statement of Intent to Register) controller
 *
 * Different item statuses
 *   C - Completed
 *   I - Initiated
 *   R - Received
 */
angular.module('calcentral.controllers').controller('SirController', function(sirFactory, sirLookupService, $scope, $q) {
  $scope.sir = {
    hasSir: false,
    checklistItems: [],
    config: {}
  };

  /**
   * Parse the CS checklist and see whether we have any
   * non-completed admission checklists for the current user
   */
  var parseChecklist = function(data) {
    var checklistItems = _.get(data, 'data.feed.checkListItems');
    if (!checklistItems) {
      return $q.reject('No checklist items');
    }

    // Filter out only the incomplete checklists (will be Initiated or Received)
    checklistItems = _.get(data, 'data.feed.checkListItems').filter(function(checklistItem) {
      return (checklistItem &&
        checklistItem.adminFunc &&
        checklistItem.adminFunc === 'ADMP' &&
        checklistItem.itemStatus !== 'C'
      );
    });

    if (checklistItems.length) {
      $scope.sir.checklistItems = checklistItems;
      return $q.resolve(checklistItems);
    } else {
      // Make sure none of the other code ever gets run
      return $q.reject('No open SIR items');
    }
  };

  /**
   * Map the checklist to the SIR Config forms & the lookup for the header name / image & title
   * They should map on the Checklist Item Code - chklstItemCd
   */
  var mapChecklist = function(forms) {
    $scope.sir.checklistItems = $scope.sir.checklistItems.map(function(checklistItem) {
      var config = _.find(forms, function(form) {
        return checklistItem.chklstItemCd === form.chklstItemCd;
      });
      checklistItem.config = config;
      checklistItem.header = sirLookupService.lookup[config.ucSirImageCd];
      return checklistItem;
    });
console.log(2, $scope.sir.checklistItems);
  };

  /**
   * Parse the SIR configuration object.
   * This contains information for each checklist item
   * @param {[type]} data [description]
   * @return {[type]} [description]
   */
  var parseSirConfig = function(data) {
    var sirConfig = _.get(data, 'data.feed.sirConfig');
    if (!sirConfig) {
      return $q.reject('No SIR Config');
    }
    mapChecklist(sirConfig.sirForms);
    $scope.sir.config.responseReasons = sirConfig.responseReasons;
    return $q.resolve(sirConfig);
  };

  var getChecklist = sirFactory.getChecklist;
  var getSirConfig = sirFactory.getSirConfig;

  /**
   * Initialize the workflow for the SIR experience
   * It contains the following steps
   *   - Get the CS (campus solutions) checklist for the current user
   *   - See whether there are any admission checklists
   *   - If there are, see whether we have any in a none-completed state
   *   - If that's the case, show a sir card for each one
   *   - If it's in the 'Received status' and there is a deposit > 0, show the deposit part.
   */
  var initWorkflow = function() {
    getChecklist()
      .then(parseChecklist)
      .then(getSirConfig)
      .then(parseSirConfig);
  };

  /**
   * Wait till the user is authenticated
   */
  $scope.$on('calcentral.api.user.isAuthenticated', function(event, isAuthenticated) {
    if (isAuthenticated) {
      initWorkflow();
    }
  });
});
