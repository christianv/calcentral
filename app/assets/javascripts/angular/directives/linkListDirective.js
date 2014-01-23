(function(angular) {
  'use strict';

  angular.module('calcentral.directives').directive('ccLinkListDirective', [function() {

    /**
     * Add to the subcategories list if it doesn't exist yet
     * @param {String} subcategory The subcategory you want to add
     * @param {Object} scope The scope of the directive
     */
    var addToSubcategories = function(subcategory, scope) {
      if (scope.subcategories.indexOf(subcategory) === -1) {
        scope.subcategories.push(subcategory);
      }
    };

    /**
     * Add to the top categories
     * @param {Object} link Link object
     * @param {Object} scope The scope of the directive
     */
    var addToTopCategories = function(link, scope) {
      for (var i = 0; i < link.categories.length; i++) {
        scope.topcategories[link.categories[i].topcategory] = true;
      }
    };

    /**
     * Depending on the roles, determine whether the current user should be able to view the link
     * @param {Object} link Link object
     * @param {Object} scope The scope of the directive
     * @return {Boolean} Whether the user should be able to view the link
     */
    var canViewLink = function(link, scope) {
      for (var i in link.roles) {
        if (link.roles.hasOwnProperty(i) &&
            link.roles[i] === true &&
            link.roles[i] ===  scope.api.user.profile.roles[i]) {
          addToTopCategories(link, scope);
          return true;
        }
      }
      return false;
    };

    /**
     * Check whether a link is in a current category
     * @param {Object} link Link object
     * @param {Object} scope The scope of the directive
     * @return {Boolean} Whether a link is in the current category
     */
    var isLinkInCategory = function(link, scope) {
      link.subCategories = [];
      for (var i = 0; i < link.categories.length; i++) {
        if (link.categories[i].topcategory === scope.currentTopCategory) {
          link.subCategories.push(link.categories[i].subcategory);
        }
      }
      return (link.subCategories.length > 0);
    };

    /**
     * Set the links for the current page
     * @param {Array} links The list of links that need to be parsed
     * @param {Object} scope The scope of the directive
     */
    var setLinks = function(links, scope) {
      scope.linklist = [];
      scope.subcategories = [];
      scope.topcategories = {};
      angular.forEach(links, function(link) {
        if (canViewLink(link, scope) && isLinkInCategory(link, scope)) {
          scope.linklist.push(link);
          for (var i = 0; i < link.subCategories.length; i++) {
            addToSubcategories(link.subCategories[i], scope);
          }
        }
      });
      scope.subcategories.sort();
    };

    return {
      link: function(scope, element, attr) {

        scope.$watch(attr.ccLinkListDirective, function ccLinkListWatch(inputLinks) {

          if (inputLinks) {
            setLinks(inputLinks, scope);
          }

        });
      }
    };

  }]);

})(window.angular);
