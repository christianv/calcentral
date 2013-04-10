(function(angular, calcentral) {
  'use strict';

  /**
   * Campus controller
   */

  calcentral.controller('MyFinancesController', [
    '$http',
    '$filter',
    '$routeParams',
    '$scope',
    'apiService',
    function(
      $http,
      $filter,
      $routeParams,
      $scope,
      apiService) {

    var isNumber = function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    };

    var parseDate = function(obj, i) {
      var regex = /^(0?[1-9]|1[012])[\/](0?[1-9]|[12][0-9]|3[01])[\/](\d{4})$/;
      var item = obj[i] + '';
      var match = item.match(regex);
      if (match && match[0]) {
        obj[i] = new Date(match[3], parseInt(match[1], 10) - 1, match[2]);
      }
    };

    var parseAmount = function(obj, i) {
      var item = obj[i];
      if (isNumber(item)) {
        obj[i] = $filter('number')(item, 2);
        if (obj[i] >= 0) {
          obj[i] = '  $ ' + obj[i];
        } else {
          obj[i] = '<span class="cc-myfincances-green">- $ ' + obj[i].replace('-', '') + '</span>';
        }
      }
    };

    var parseDueDate = function(obj, i) {
      var item = obj[i];
      var test = Object.prototype.toString.call(item) === '[object Date]';
      if (test) {
        obj[i] = $filter('date')(item, 'MMM d');
      }
    };

    var parseData = function() {
      var finances = angular.copy($scope.myfinances);
      for (var i in finances.summary) {
        if (finances.summary.hasOwnProperty(i)){
          parseDate(finances.summary, i);
          parseAmount(finances.summary, i);
        }
      }

      finances.activity.forEach(function(element) {
        for (var j in element) {
          if (element.hasOwnProperty(j)){

            parseDate(element, j);
            parseAmount(element, j);
            if (j === 'transDueDate') {
              parseDueDate(element, j);
            }
          }
        }
      });
      $scope.myfinances = finances;
    };

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

        parseData();

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
