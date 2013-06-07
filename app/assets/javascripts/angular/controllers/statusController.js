(function(calcentral) {
  'use strict';

  /**
   * Status controller
   */
  calcentral.controller('StatusController', ['$scope', function($scope) {

    var showStatusError = function() {
      $scope.showStatusError =
        $scope.user.profile.student_info &&
        ($scope.user.profile.student_info.reg_status.needsAction ||
        $scope.user.profile.student_info.california_residency.needsAction ||
        $scope.user.profile.student_info.reg_block.needsAction);
    };

    $scope.$watch('user._isAuthenticated', function(isAuthenticated) {
      if (isAuthenticated) {
        showStatusError();
      }
    });

  }]);

})(window.calcentral);
