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
        var currency = $filter('number')(item, 2);
        if (obj[i] >= 0) {
          obj[i + 'Show'] = '  $ ' + currency;
        } else {
          obj[i + 'Show'] = '<span class="cc-myfincances-green">- $ ' + currency.replace('-', '') + '</span>';
        }
      }
    };

    var parseDueDate = function(obj, i) {
      var item = obj[i];
      var test = Object.prototype.toString.call(item) === '[object Date]';
      if (test) {
        obj.transDueDateShow = $filter('date')(item, 'MMM d');
        if (obj.transStatus === 'pastDue') {
          obj._isPastDueDate = true;
        }
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

    var statuses = {
      'open': ['current','pastDue','future'],
      'minimumamountdue': ['current','pastDue'],
      'all': ['current','pastDue','future', 'closed']
    };

    var createCount = function(statusArray) {
      var count = 0;
      for (var i = 0; i < $scope.myfinances.activity.length; i++){
        var item = $scope.myfinances.activity[i];

        if (statusArray.indexOf(item.transStatus) !== -1) {
          count++;
        }
      }
      if (count !== 0) {
        $scope.countButtons++;
      }
      return count;
    };

    var createCounts = function() {
      $scope.countButtons = 0;
      $scope.counts = {
        'open': createCount(statuses.open),
        'minimumamountdue': createCount(statuses.minimumamountdue),
        'all': createCount(statuses.all)
      };
      $scope.countButtonsClass = $scope.countButtons === 1 ? 'cc-myfinances-100' : 'even-' + $scope.countButtons;
    };

    var findStudentDate = function(students, uid) {
      for (var i = 0; i < students.length; i++) {
        if (students[i].uid === uid) {
          return students[i];
        }
      }
      return {};
    };

    var checkAllZero = function() {
      var summary = $scope.myfinances.summary;
      $scope.isAllZero = (summary.anticipatedAid === 0 &&
        summary.lastStatementBalance === 0 &&
        summary.unbilledActivity === 0 &&
        summary.futureActivity === 0 &&
        summary.totalPastDueAmount === 0 &&
        summary.minimumAmountDue === 0);
    };

    /**
     * Get the student's financial information
     */
    var getStudentInfo = function() {

      // Data contains "students"
      $http.get('/json/student_financials.json').success(function(data) {
        // TODO select the right user
        $scope.myfinances = findStudentDate(data.students, $scope.user.profile.uid);

        if ($scope.myfinances.uid) {
          parseData();

          createTerms();

          createCounts();

          checkAllZero();
        }

        apiService.util.setTitle('My Finances');
      });
    };

    //http://jsfiddle.net/vojtajina/js64b/14/
    $scope.sort = {
      column: 'transDate',
      descending: true
    };

    $scope.getSortClass = function(column) {
      var sortUpDown = $scope.sort.descending ? 'down' : 'up';
      return column == $scope.sort.column && 'icon-chevron-' + sortUpDown;
    };

    $scope.changeSorting = function(column) {
      var sort = $scope.sort;
      if (sort.column === column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.$watch('transStatusSearch', function(status) {
      if (status === 'open') {
        $scope.searchStatuses = statuses.open;
      } else if (status === 'minamountdue') {
        $scope.searchStatuses = statuses.minimumamountdue;
      } else {
        $scope.searchStatuses = statuses.all;
      }
    });

    $scope.currentTerm = 'Spring 2013';
    $scope.statusFilter = function(item) {
      return ($scope.searchStatuses.indexOf(item.transStatus) !== -1);
    };

    $scope.notrefundFilter = function(item) {
      if ($scope.notrefund && item.transType === 'refund') {
        return false;
      } else {
        return true;
      }
    };

    // We need to wait until the user is loaded
    $scope.$watch('user.isLoaded', function(isLoaded) {
      if (isLoaded) {
        getStudentInfo();
      }
    });

  }]);

})(window.angular, window.calcentral);
