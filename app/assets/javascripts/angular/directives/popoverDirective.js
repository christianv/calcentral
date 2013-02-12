(function(angular) {
  'use strict';

  angular.module('calcentral.directives').directive('ccPopover', function() {
    var openPopovers = 0;

    var link = function(scope, element, attrs, ctrl) {
      //ctrl.$scope
      scope.isOpen = false;
      element.bind('click', function(){
        scope.isOpen = !scope.isOpen;
        console.log(scope.isOpen);
        //console.log(1);
        //console.log(attrs);
      });

      if (attrs) {
        openPopovers--;
      } else {
        openPopovers++;
      }
      /*elm.click(function(){
        console.log(1);
        openPopovers.push(elm);
      });*/
    };

    return {
      restrict: 'A', // Restrict it to attributes
      link: link
    };
  });

})(window.angular);
