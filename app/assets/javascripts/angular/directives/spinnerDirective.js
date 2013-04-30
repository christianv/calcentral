(function(angular) {
  'use strict';

  /**
   * This directive will make sure that external links are always opened in a new window
   * To make it more accessible, we also add an extra message to each element.
   */
  angular.module('calcentral.directives').directive('ccSpinnerDirective', function() {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {
        scope._is_loading = true;
        var html;

        /**
         * Check whether _is_loading has changed
         */
        var watch = function(value) {
          if (value) {
            elm.addClass('cc-spinner');
          } else {
            elm.removeClass('cc-spinner');
          }
        };

        scope.$watch('_is_loading', watch);
      }
    };
  });

})(window.angular);
