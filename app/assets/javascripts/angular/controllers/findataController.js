(function(calcentral) {
  'use strict';

  /**
   * Findata controller
   */
  calcentral.controller('FindataController', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {

    $rootScope.title = 'Findata | CalCentral';

    $http({
      'method': 'JSONP',
      'url': 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22https%3A%2F%2Fgist.github.com%2Fsaraquigley%2F4543131%2Fraw%2Fstudents.json%22&format=json&callback=JSON_CALLBACK'
    }).success(function(data) {
      $scope.students = data.query.results.json.students;
      $scope.student = $scope.students[0];
    });

  }]);

})(window.calcentral);
