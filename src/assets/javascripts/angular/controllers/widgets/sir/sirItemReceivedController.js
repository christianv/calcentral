

'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * SIR (Statement of Intent to Register) item receid controller
 * This controller will be executed when the current checklist item is in received status
 */
angular.module('calcentral.controllers').controller('SirItemReceivedController', function(sirFactory, $scope) {
  $scope.sirReceivedItem = {
    isLoading: true
  };

  var parseDepostInformation = function(data) {
    console.log('data', data);
  };

  /**
   * Get information about the deposit, whether you still need to pay or not
   */
  var getDepostInformation = function() {
    console.log('$scope.item - admApplNbr', $scope.item.checkListMgmtAdmp.admApplNbr);
    sirFactory.getDeposit({
      params: {
        // TODO - Camelcase when SISRP-7728 is fixed
        'adm_appl_nbr': $scope.item.admApplNbr
      }
    }).then(parseDepostInformation);
  };

  var init = function() {
    getDepostInformation();
  };

  init();
});
