(function(angular, calcentral) {
  'use strict';

  /**
   * Campus controller
   */

  calcentral.controller('MyFinancesController', [
    '$http', '$routeParams', '$scope', 'apiService', function($http, $routeParams, $scope, apiService) {

    var createTerms = function() {
      var terms = [];
      for (var i = 0; i < $scope.myfinances.activity.length; i++){
        var item = $scope.myfinances.activity[i];

        if (terms.indexOf(item.transTerm) === -1) {
          terms.push(item.transTerm);
        }
      }
      $scope.myfinances.terms = terms;
    };

    /**
     * Get the student's financial information
     */
    var getStudentInfo = function() {

      // Data contains "students"
      $http.get('/json/student_financials.json').success(function(data) {
        // TODO select the right user
        $scope.myfinances = data.students[0];

        createTerms();

        apiService.util.setTitle('My Finances');
      });
    };

    // We need to wait until the user is loaded
    $scope.$watch('user.isLoaded', function(isLoaded) {
      if (isLoaded) {
        getStudentInfo();
      }
    });

  }]);

})(window.angular, window.calcentral);
