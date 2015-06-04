(function(angular, Raven) {
  'use strict';

  angular.module('calcentral.services').service('errorService', function(calcentralConfigFactory) {
    var calcentralConfig = {};

    var findElement = function(id) {
      var element = document.getElementById(id);
      if (element && element.innerHTML) {
        return element.innerHTML;
      }
    };

    /**
     * Send an error exception
     * @param {String} exception, tags The exception label to send,
     * followed by a hash of tags we want to capture in Sentry.
     */
    var send = function(exception) {
      exception = exception.message || exception;
      var uid = findElement('cc-footer-uid');
      var actAsUid = findElement('cc-footer-actingas-uid');

      Raven.captureMessage(exception, {
        tags: {
          actAsUid: actAsUid,
          appVersion: calcentralConfig.applicationVersion,
          host: calcentralConfig.clientHostname,
          uid: uid
        }
      });
    };

    calcentralConfigFactory.getConfig().success(function(data) {
      Raven.config(data.sentryUrl).install();
      calcentralConfig = data;
    });

    // Expose methods
    return {
      send: send
    };
  });
}(window.angular, window.Raven));
