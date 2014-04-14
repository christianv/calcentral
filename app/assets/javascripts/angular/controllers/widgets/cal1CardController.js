(function(angular) {
  'use strict';

  /**
   * Footer controller
   */
  angular.module('calcentral.controllers').controller('Cal1CardController', function(cal1CardFactory, $scope) {

    var loadCal1Card = function() {
      cal1CardFactory.getCal1Card().success(function(data) {
        angular.extend($scope, data);
        data.cal1card = data.body;
      });
    };

    loadCal1Card();

  });

})(window.angular);
