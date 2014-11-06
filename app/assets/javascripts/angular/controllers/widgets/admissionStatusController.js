(function(angular) {
  'use strict';

  /**
   * Admission Status controller
   */
  angular.module('calcentral.controllers').controller('AdmissionStatusController', function(tasksFactory, $interval, $rootScope, $scope) {
    var initialized = false;
    var updateSeries = function() {
      $scope.chartConfig.series[0].data[0][1] = $scope.percentage;
      $scope.chartConfig.series[0].data[1][1] = 1 - $scope.percentage;
    };

    var updateTitle = function() {
      $scope.chartConfig.title.text = $scope.percentageString + '%';
    };

    var filterCompleted = function(task) {
      return (task.status === 'completed');
    };

    var createCounts = function(tasks) {
      $scope.counts = {
        completed: tasks.filter(filterCompleted).length,
        total: tasks.length
      };
      $scope.percentage = $scope.counts.completed / $scope.counts.total;
      $scope.percentageString = Math.round($scope.percentage * 100);
    };

    var initializeChart = function() {
      $scope.chartConfig = {
        options: {
          chart: {
            // renderTo: 'container',
            type: 'pie'
          },
          tooltip: {
            formatter: function() {
              return false;
            }
          },
          plotOptions: {
            pie: {
              colors: ['#1a689a', '#e3e3e3'],
              states: {
                hover: {
                  enabled: false
                }
              }
            }
          }
        },
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        title: {
          text: '',
          align: 'center',
          verticalAlign: 'middle',
          y: 0,
          useHTML: true,
          style: {
            fontFamily: '',
            fontSize: ''
          }
        },
        series: [{
          name: 'Progress',
          data: [['Complete', 0],['Incomplete', 1]],
          size: '100%',
          innerSize: '80%',
          borderWidth: 0,
          showInLegend: false,
          dataLabels: {
            enabled: false
          }
        }]
      };
    };

    var listenForTasks = function() {
      $rootScope.$on('calcentral.tasks.updated', function(evt, tasks) {
        if (!initialized) {
          initialized = true;
          initializeChart();
        }
        createCounts(tasks);
        updateSeries();
        updateTitle();
      });
    };

    listenForTasks();
  });
})(window.angular);
