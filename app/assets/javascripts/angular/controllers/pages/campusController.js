(function(angular) {
  'use strict';

  /**
   * Campus controller
   */

  angular.module('calcentral.controllers').controller('CampusController', function($http, $routeParams, $scope, apiService) {

    /**
     * Get the category name, when you feed in an id
     * @param {String} categoryId A category id
     * @return {String} The category name
     */
    var getCategoryName = function(categoryId) {
      var navigation = $scope.navigation;

      // We want to explicitly check for undefined here
      // since other values need to result in a 404.
      if (categoryId === undefined) {
        return navigation[0].categories[0].name;
      }

      for (var i = 0; i < navigation.length; i++) {
        for (var j = 0; j < navigation[i].categories.length; j++) {
          if (navigation[i].categories[j].id === categoryId) {
            return navigation[i].categories[j].name;
          }
        }
      }
    };

    /**
     * Get the links
     */
    var getLinks = function() {
      // Data contains "links" and "navigation"
      var link_data_url = '/json/campuslinks_v16.json';
      if ($scope.api.user.profile.features.live_campus_links_data) {
        link_data_url = '/api/my/campuslinks';
      }
      $http.get(link_data_url).success(function(campusdata) {
      //$http.get('/json/campuslinks.json').success(function(campusdata) {
        angular.extend($scope, campusdata);

        $scope.currentTopCategory = getCategoryName($routeParams.category);
        var title = 'Campus - ' + $scope.currentTopCategory;
        apiService.util.setTitle(title);
      });
    };

    // We need to wait until the user is loaded
    $scope.$on('calcentral.api.user.isAuthenticated', function(event, isAuthenticated) {
      if(isAuthenticated) {
        getLinks();
      }
    });

  })

  // There is no way to pass in a parameter to a filter, so we need to create our own
  // http://stackoverflow.com/questions/11753321
  // This filter will allow us to only show items in a certain subcategory
  .filter('linksubcategory', function(){
    return function(items, name){
      var arrayToReturn = [];
      for (var i = 0; i < items.length; i++){
        var item = items[i];
        for (var j = 0; j < item.subCategories.length; j++) {
          if (item.subCategories[j] === name) {
            arrayToReturn.push(item);
          }
        }
      }

      return arrayToReturn;
    };
  });

})(window.angular);
