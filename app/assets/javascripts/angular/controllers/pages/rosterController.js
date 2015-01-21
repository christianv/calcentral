(function(angular) {
  'use strict';

  /**
   * Canvas roster photos LTI app controller
   */
  angular.module('calcentral.controllers').controller('RosterController', function(apiService, rosterFactory, $routeParams, $scope) {
    if ($routeParams.canvasCourseId) {
      apiService.util.setTitle('Roster Photos');
    }

    $scope.studentInSectionFilter = function(student) {
      if (!$scope.searchSection) {
        return true;
      }
      return (student.section_ccns.indexOf($scope.searchSection) !== -1);
    };

    var getRoster = function() {
      $scope.context = $scope.campusCourseId ? 'campus' : 'canvas';
      $scope.courseId = $scope.campusCourseId || $routeParams.canvasCourseId || 'embedded';

      rosterFactory.getRoster($scope.context, $scope.courseId).success(function(data) {
        angular.extend($scope, data);
        apiService.util.iframeUpdateHeight();
      }).error(function(data, status) {
        angular.extend($scope, data);
        $scope.errorStatus = status;
      });
    };

    getRoster();
  });
})(window.angular);
