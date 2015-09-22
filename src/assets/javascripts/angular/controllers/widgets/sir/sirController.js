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
    checklistItems: []
  };

  var sirConfig = {};

  /**
   * Update the checklist items that need to be updated
   * We should only update the items that already are in the current scope & have an updated status.
   */
  var updateChecklistItems = function(checklistItems) {
    // If we don't have any checklist items yet, we should definitely update the scope
    if (!$scope.sir.checklistItems.length) {
      $scope.sir.checklistItems = checklistItems;
      return;
    }
console.log('updateChecklistItems', checklistItems);
    _(checklistItems).forEach(function(checklistItem) {
      var result = _.findWhere($scope.sir.checklistItems, {
        chklstItemCd: checklistItem.chklstItemCd
      });
      console.log('result', result);
      // If we don't find it in the current scope, it's a new item, so we should add it
      if (!result) {
        $scope.sir.checklistItems.push(checklistItem);
      } else {
        if (result.itemStatus !== checklistItem.itemStatus) {
          // Update specific checklist item
          var index = _.indexOf($scope.sir.checklistItems, result);
          console.log('index', index);
          $scope.sir.checklistItems.splice(index, 1, checklistItem);
          console.log('checklistitems - last', $scope.sir.checklistItems);
        }
      }
    });
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
      console.log('1 - checklistItems', JSON.stringify(checklistItems));
      updateChecklistItems(checklistItems);

      checklistItems = [
    {
        "emplid": "CC00000004",
        "chklstItemCd": "AGS002",
        "checkListDescr": "Statement Intent to Register",
        "itemStatus": "Received",
        "itemStatusCode": "R",
        "statusDt": "2015-09-16",
        "dueDt": "2015-08-17",
        "responsibleCntctName": "Bender Rodriguez",
        "responsibleCntctEmail": "BCS@BERKELEY.EDU",
        "associationIdName": null,
        "itemComment": "Grad SIR 2 (Haas FT MBA)",
        "adminFunc": "ADMP",
        "adminFuncDescr": "Admissions Program",
        "checkListDocMgmt": {
            "linkUrlLbl": null,
            "linkUrl": null,
            "docUploadLink": null,
            "displayStatusDt": null,
            "displayDueDt": null
        },
        "checkListMgmtAdmp": {
            "varDataSeq": "1",
            "acadCareer": "GRAD",
            "stdntCarNbr": "0",
            "admApplNbr": "00000134",
            "applProgNbr": "0"
        }
    },
    {
        "emplid": "CC00000004",
        "chklstItemCd": "AGS004",
        "checkListDescr": "Statement Intent to Register",
        "itemStatus": "Received",
        "itemStatusCode": "R",
        "statusDt": "2015-09-16",
        "dueDt": "2015-08-17",
        "responsibleCntctName": "Bender Rodriguez",
        "responsibleCntctEmail": "BCS@BERKELEY.EDU",
        "associationIdName": null,
        "itemComment": "Exec MBA SIR",
        "adminFunc": "ADMP",
        "adminFuncDescr": "Admissions Program",
        "checkListDocMgmt": {
            "linkUrlLbl": null,
            "linkUrl": null,
            "docUploadLink": null,
            "displayStatusDt": null,
            "displayDueDt": null
        },
        "checkListMgmtAdmp": {
            "varDataSeq": "2",
            "acadCareer": "GRAD",
            "stdntCarNbr": "0",
            "admApplNbr": "00000134",
            "applProgNbr": "1"
        }
    }
];

      updateChecklistItems(checklistItems);

      return $q.resolve(checklistItems);
    } else {
      // Make sure none of the other code ever gets run
      return $q.reject('No open SIR items');
    }
  };

  /**
   * We find the header for the the current config object
   * If dont' find it, use the default one.
   */
  var findHeader = function(imageCode) {
    var header = sirLookupService.lookup[imageCode];
    if (!header) {
      header = sirLookupService.lookup.DEFAULT;
    }
    return header;
  };

  /**
   * Map an individual checklist item to the SIR Config to
   *   the specific SIR form
   *   the specific response reasons
   *   lookup the header name / image & title
   * They should map on the Checklist Item Code - chklstItemCd
   */
  var mapChecklistItem = function(checklistItem) {
    // Map the correct config object
    var config = _.find(sirConfig.sirForms, function(form) {
      return checklistItem.chklstItemCd === form.chklstItemCd;
    });
    checklistItem.config = config;

    // Map to the correct header information (e.g. image / name)
    checklistItem.header = findHeader(config.ucSirImageCd);

    // Map to the correct response codes
    checklistItem.responseReasons = sirConfig.responseReasons.filter(function(reason) {
      return reason.acadCareer === config.acadCareer;
    });

    return checklistItem;
  };

  /**
   * Map the checklist items to the SIR Config
   */
  var mapChecklistItems = function() {
    $scope.sir.checklistItems = $scope.sir.checklistItems.map(mapChecklistItem);
  };

  /**
   * Parse the SIR configuration object.
   * This contains information for each checklist item
   */
  var parseSirConfig = function(data) {
    sirConfig = _.get(data, 'data.feed.sirConfig');
    if (!sirConfig) {
      return $q.reject('No SIR Config');
    }
    mapChecklistItems();
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

  initWorkflow();
});
