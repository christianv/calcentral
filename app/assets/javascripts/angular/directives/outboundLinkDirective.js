(function(angular) {
  'use strict';

  var IS_SAME_DOMAIN_URL_MATCH = /^(([^:]+):)?\/\/(\w+:{0,1}\w*@)?([\w\.-]*)?(:([0-9]+))?(.*)$/;
  var DEFAULT_PORTS = {'http': 80, 'https': 443, 'ftp': 21};
  var URL_MATCH = /^([^:]+):\/\/(\w+:{0,1}\w*@)?([\w\.-]*)(:([0-9]+))?(\/[^\?#]*)?(\?([^#]*))?(#(.*))?$/;

  /**
   * Parse a request and location URL and determine whether this is a same-domain request.
   * This function has been copied over from AngularJS since they don't expose this function
   *
   * @param {string} requestUrl The url of the request.
   * @param {string} locationUrl The current browser location url.
   * @returns {boolean} Whether the request is for the same domain.
   */
  function isSameDomain(requestUrl, locationUrl) {
    var match = IS_SAME_DOMAIN_URL_MATCH.exec(requestUrl);
    // if requestUrl is relative, the regex does not match.
    if (match === null) {
      return true;
    }

    var domain1 = {
        protocol: match[2],
        host: match[4],
        port: parseInt(match[6], 10) || DEFAULT_PORTS[match[2]] || null,
        // IE8 sets unmatched groups to '' instead of undefined.
        relativeProtocol: match[2] === undefined || match[2] === ''
      };

    match = URL_MATCH.exec(locationUrl);
    var domain2 = {
        protocol: match[1],
        host: match[3],
        port: parseInt(match[5], 10) || DEFAULT_PORTS[match[1]] || null
      };

    return (domain1.protocol == domain2.protocol || domain1.relativeProtocol) &&
           domain1.host == domain2.host &&
           (domain1.port == domain2.port || (domain1.relativeProtocol &&
               domain2.port == DEFAULT_PORTS[domain2.protocol]));
  }


  angular.module('calcentral.directives').directive('a', function() {
    return {
      restrict: 'E',
      priority: 200, // we need to run this after ngHref has changed
      link: function(scope, element, attr) {
        console.log(element[0].innerHTML);
        var updateUrl = function(url) {
          // We only want to change anchor tags that link to a different domain
          if (!isSameDomain(url, location.href)) {
            console.log(url);
            attr.$set('target', '_blank');
            attr.$set('aria-label', 'Opens in new window');
          }
        };

        var observe = function(value) {
          // Check whether the element actually has an href
          if (value) {
            updateUrl(value);
          }
        };

        attr.$observe('href', observe);
      }
    };
  });

})(window.angular);
