

(function(angular) {
  'use strict';

  /**
   * Activity controller
   */
  angular.module('calcentral.controllers').controller('FinaidBudgetController', function(finaidFactory, $scope) {
    // TODO bring into util API (see AmountDirective)
    var isNumber = function(number) {
      return !isNaN(parseFloat(number)) && isFinite(number);
    };
    // TODO bring into util API (see AmountDirective)
    var numberWithCommas = function(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    // TODO bring into util API (see AmountDirective)
    var parseAmount = function(value) {
      if (!isNumber(value)) {
        return value;
      }

      var text = '';
      if (value >= 0) {
        text = '  $ ' + numberWithCommas(value);
      }
      text = text.replace(/\s/g, '\u00A0');
      return text;
    };
    var parseAmounts = function(items) {
      for (var i = 0; i < items.length; i++) {
        items[i].amountText = parseAmount(items[i].amount);
      }
    };

    var prepareChartData = function(items) {
      var data = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!isNumber(item.amount)) {
          continue;
        }
        data.push({
          name: item.title,
          y: item.amount
        });
      }
      return data;
    };

    var loadChart = function(chartData) {
      $scope.chartConfig = {
        options: {
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
          }
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        series: [{
          type: 'pie',
          // Start To change
          dataLabels: {
            enabled: false
          },
          // End To change
          data: chartData
        }],
        // Disable the chart title
        title: {
          text: ''
        },
        loading: false,
        // Hide the Highcharts watermark
        credits: {
          enabled: false
        }
      };
    };

    var getFinaidActivity = function() {
      finaidFactory.getBudget().success(function(data) {
        angular.extend($scope, data);

        var budget = data.finaidBudget.terms[0];
        parseAmounts(budget.items);
        $scope.budget = budget;

        var chartData = prepareChartData(budget.items);
        loadChart(chartData);
      });
    };

    getFinaidActivity();
  });
})(window.angular);
