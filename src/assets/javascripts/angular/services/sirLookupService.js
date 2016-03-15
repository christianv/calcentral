'use strict';

var angular = require('angular');

/**
 * SIR Lookup service
 */
angular.module('calcentral.services').factory('sirLookupService', function() {
  /**
   * A lookup object to map the sir image code (ucSirImageCd) to a name, title & image
   * Images can be found at https://jira.berkeley.edu/browse/SISRP-6561
   */
  var lookup = {
    DEFAULT: {
      background: 'cc-widget-sir-background-berkeley'
    },
    GRADDIV: {
      name: 'Fiona M. Doyle',
      title: 'Dean of the Graduate Division',
      background: 'cc-widget-sir-background-berkeley',
      picture: 'cc-widget-sir-picture-grad'
    },
    HAASGRAD: {
      name: 'Richard Lyons',
      title: 'Haas School of Business, Dean',
      background: 'cc-widget-sir-background-haasgrad',
      picture: 'cc-widget-sir-picture-haasgrad'
    },
    LAW: {
      name: 'Sujit Choudhry',
      title: 'Dean of Law School',
      background: 'cc-widget-sir-background-lawjd',
      picture: 'cc-widget-sir-picture-lawjd'
    },
    UGRD: {
      name: 'Amy W. Jarich',
      title: 'Assistant Vice Chancellor & Director',
      background: 'cc-widget-sir-background-berkeley',
      picture: 'cc-widget-sir-picture-ugrad'
    }
  };

  return {
    lookup: lookup
  };
});
