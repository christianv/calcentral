(function(angular) {
  'use strict';

  angular.module('calcentral.directives').directive('ccAmountDirective', ['$filter', '$timeout', function($filter, $timeout) {

    var isNumber = function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    };

    return {
      priority: 200,
      link: function(scope, element, attr) {

        // Watch for changes on the thing it is bound to
        scope.$watch(attr.ngBind, function(value) {

          // Only do something when it's a number
          if (!isNumber(value)) {
            return;
          }

          var currency = $filter('number')(value, 2);
          var text = '';
          if (value >= 0) {
            text = '  $ ' + currency;
          } else {
            text = '- $ ' + currency.replace('-', '');
            element.addClass('cc-myfincances-green');
          }
          $timeout(function() {
            element.text(text);
          }, 1);
        });
      }
    };

  }]);

})(window.angular);
