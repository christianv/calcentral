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

    var transTypes = [];

    var linkMapper = {
      'Housing & Dining': 'http://www.housing.berkeley.edu/',
      'University Health Services': 'http://www.uhs.berkeley.edu/home/contact/',
      'Recreational Sports Facility': 'http://recsports.berkeley.edu/about/contact-us/customer-service-center/',
      'Graduate Division': 'http://grad.berkeley.edu/financial/index.shtml',
      'other': 'http://studentcentral.berkeley.edu/contact'
    };

    var parseDate = function(obj, i) {
      var regex = /^(0?[1-9]|1[012])[\/](0?[1-9]|[12][0-9]|3[01])[\/](\d{4})$/;
      var item = obj[i] + '';
      var match = item.match(regex);
      if (match && match[0]) {
        obj[i] = new Date(match[3], parseInt(match[1], 10) - 1, match[2]);
      }
    };

    var parseTransBalanceAmount = function(element) {
      if (linkMapper[element.transDept]) {
        element.transDeptUrl = linkMapper[element.transDept];
      } else {
        element.transDeptUrl = linkMapper.other;
      }
    };

    var parseDepartmentUrls = function(element) {
      if (element.transStatus !== 'closed' && element.transBalance !== element.transAmount) {
        element.originalAmount = element.transAmount;
        element.transBalanceAmount = element.transBalance;
      } else {
        element.transBalanceAmount = element.transAmount;
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

    var addToTranstypes = function(element) {
      if (transTypes.indexOf(element.transType) === -1) {
        transTypes.push(element.transType);
      }
    };

    var parseData = function() {
      transTypes = [];
      var finances = angular.copy($scope.myfinances);
      for (var i in finances.summary) {
        if (finances.summary.hasOwnProperty(i)){
          parseDate(finances.summary, i);
        }
      }

      finances.activity.forEach(function(element) {
        parseTransBalanceAmount(element);
        parseDepartmentUrls(element);
        for (var j in element) {
          if (element.hasOwnProperty(j)){

            parseDate(element, j);
            addToTranstypes(element);
            if (j === 'transDueDate') {
              parseDueDate(element, j);
            }
          }
        }
      });
      $scope.myfinances = finances;
      $scope.transTypes = transTypes.sort();
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

        if (statusArray.indexOf(item.transStatus) !== -1 && item.transType !== 'refund') {
          count++;
        }
      }
      if (count !== 0) {
        $scope.countButtons++;
      }
      return count;
    };

    var createCountRefund = function() {
      var count = 0;
      for (var i = 0; i < $scope.myfinances.activity.length; i++){
        var item = $scope.myfinances.activity[i];

        if (item.transType === 'refund') {
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
        'refunds': createCountRefund(),
        'all': createCount(statuses.all)
      };
      $scope.countButtonsClass = $scope.countButtons === 1 ? 'cc-page-myfinances-100' : 'cc-even-' + $scope.countButtons;
    };

    /*var findStudentData = function(students, uid) {
      console.log(uid);
      for (var i = 0; i < students.length; i++) {
        if (students[i].uid === uid) {
          return students[i];
        }
      }
      return {};
    };*/

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
      $http.get('/api/my/cars').success(function(data) {
        // TODO select the right user
        //$scope.myfinances = findStudentData(data.students, $scope.api.user.profile.uid);

        $scope.myfinances = data.edw;

        if ($scope.myfinances.person_id) {
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

    $scope.currentTerm = 'Fall 2013';
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
    $scope.$on('calcentral.api.user.isAuthenticated', function(event, isAuthenticated) {
      if (isAuthenticated) {
        getStudentInfo();
      }
    });

  }]);

})(window.angular, window.calcentral);
