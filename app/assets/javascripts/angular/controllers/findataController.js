(function(calcentral) {
  'use strict';

  /**
   * Findata controller
   */
  calcentral.controller('FindataController', ['$rootScope', '$scope', function($rootScope, $scope) {

    $rootScope.title = 'Findata | CalCentral';

    $scope.students = [
      {
        'name': 'Student 1',
        'url': 'http://bl.ocks.org/d/4543131/'
      },
      {
        'name': 'Student 2',
        'url': 'http://bl.ocks.org/d/4616393/'
      }
    ];
    $scope.student = $scope.students[0];

  }]);

})(window.calcentral);
