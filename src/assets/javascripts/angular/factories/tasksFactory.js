'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * Tasks Factory
 */
angular.module('calcentral.factories').factory('tasksFactory', function(apiService, $http) {
  var clearCompletedUrl = '/api/my/tasks/clear_completed';
  var removeUrl = '/api/my/tasks/delete/';
  var url = '/api/my/tasks';

  var clearCompletedTasks = function(params) {
    return $http.post(clearCompletedUrl, params);
  };

  var remove = function(task) {
    return $http.post(removeUrl + task.id, task);
  };

  var filterFinaidTasks = function(data, options) {
    var filteredTasks = _.filter(data.tasks, {
      cs: {
        isFinaid: true,
        finaidAidYear: options.finaidYearId
      }
    });
    data.tasks = filteredTasks;
    return data;
  };

  var getFinaidTasks = function(options) {
    return getTasks(options).then(function(data) {
      return filterFinaidTasks(data, options);
    });
  };

  var getTasks = function(options) {
    return apiService.http.request(options, url).then(function(xhr) {
      return xhr.data;
    });
  };

  var update = function(task) {
    return $http.post(url, task);
  };

  return {
    clearCompletedTasks: clearCompletedTasks,
    remove: remove,
    getFinaidTasks: getFinaidTasks,
    getTasks: getTasks,
    update: update
  };
});
