(function(angular) {
  'use strict';

  /**
   * Canvas course provisioning LTI app controller
   */
  angular.module('calcentral.controllers').controller('CanvasCourseProvisionController', function (apiService, $http, $scope, $timeout, $window) {

    apiService.util.setTitle('bCourses Course Provision');

    /**
     * Post a message to the parent
     * @param {String|Object} message Message you want to send over.
     */
    var postMessage = function(message) {
      if ($window.parent) {
        $window.parent.postMessage(message, '*');
      }
    };

    var postHeight = function() {
      postMessage({
        height: document.body.scrollHeight
      });
    };

    var statusProcessor = function() {
      if ($scope.status === 'Processing' || $scope.status === 'New') {
        courseSiteJobStatusLoader();
      } else {
        $timeout.cancel(timeoutPromise);
      }
    };

    var timeoutPromise;
    var courseSiteJobStatusLoader = function() {
      $scope.currentWorkflowStep = 'monitoring_job';
      timeoutPromise = $timeout(function() {
        fetchStatus(statusProcessor);
      }, 2000);
    };

    var clearCourseSiteJob = function() {
      delete $scope.job_id;
      delete $scope.job_request_status;
      delete $scope.status;
      delete $scope.completed_steps;
      delete $scope.percent_complete;
    };

    var courseSiteJobCreated = function(data) {
      angular.extend($scope, data);
      courseSiteJobStatusLoader();
    };

    $scope.createCourseSiteJob = function(selectedCourses) {
      var ccns = [];
      angular.forEach(selectedCourses, function(course) {
        angular.forEach(course.sections, function(section) {
          if (section.selected) {
            ccns.push(section.ccn);
          }
        });
      });
      if (ccns.length > 0) {
        var newCourse = {
          'term_slug': $scope.current_semester,
          'ccns': ccns
        };
        if ($scope.is_admin) {
          if ($scope.admin_mode !== 'by_ccn' && $scope.admin_acting_as) {
            newCourse.admin_acting_as = $scope.admin_acting_as;
          } else if ($scope.admin_mode === 'by_ccn' && $scope.admin_by_ccns) {
            newCourse.admin_by_ccns = $scope.admin_by_ccns;
            newCourse.admin_term_slug = $scope.current_admin_semester;
          }
        }
        $http.post('/api/academics/canvas/course_provision/create', newCourse)
          .success(courseSiteJobCreated)
          .error(function() {
            angular.extend($scope, {
              currentWorkflowStep: 'monitoring_job',
              status: 'Error',
              error: 'Failed to create course provisioning job.'
            });
          });
      }
    };

    var fetchStatus = function(callback) {
      var statusRequest = {
        url: '/api/academics/canvas/course_provision/status.json',
        method: 'GET',
        params: { 'job_id': $scope.job_id }
      };
      $http(statusRequest).success(function(data) {
        angular.extend($scope, data);
        $scope.percentCompleteRounded = Math.round($scope.percent_complete * 100);
        callback();
      });
    };

    $scope.fetchFeed = function() {
      clearCourseSiteJob();
      angular.extend($scope, {
        currentWorkflowStep: 'selecting',
        isLoading: true,
        created_status: false
      });
      var feed_url = '/api/academics/canvas/course_provision';
      var feed_params = {};
      if ($scope.is_admin) {
        if ($scope.admin_mode !== 'by_ccn' && $scope.admin_acting_as) {
          feed_url = '/api/academics/canvas/course_provision_as/' + $scope.admin_acting_as;
        } else if ($scope.admin_mode === 'by_ccn' && $scope.admin_by_ccns) {
          feed_params = {
            'admin_by_ccns[]': $scope.admin_by_ccns,
            'admin_term_slug': $scope.current_admin_semester
          };
        }
      }
      $http({
        url: feed_url,
        method: 'GET',
        params: feed_params
      }).success(function(data) {
        angular.extend($scope, data);
        fillCourseSites($scope.teaching_semesters);
        window.setInterval(postHeight, 250);
        if ($scope.teaching_semesters && $scope.teaching_semesters.length > 0) {
          $scope.switchSemester($scope.teaching_semesters[0]);
        }
        if (!$scope.current_admin_semester && $scope.admin_semesters && $scope.admin_semesters.length > 0) {
          $scope.switchAdminSemester($scope.admin_semesters[0]);
        }
        if ($scope.admin_mode === 'by_ccn' && $scope.admin_by_ccns) {
          selectAllSections();
        }
      });
    };

    var fillCourseSites = function(semesters_feed) {
      angular.forEach(semesters_feed, function(semester) {
        angular.forEach(semester.classes, function(course) {
          var has_sites = false;
          var ccn_to_sites = {};
          angular.forEach(course.class_sites, function(site) {
            if (site.emitter === 'bCourses') {
              angular.forEach(site.sections, function(site_section) {
                has_sites = true;
                if (!ccn_to_sites[site_section.ccn]) {
                  ccn_to_sites[site_section.ccn] = [];
                }
                ccn_to_sites[site_section.ccn].push(site);
              });
            }
          });
          if (has_sites) {
            course.has_sites = has_sites;
            angular.forEach(course.sections, function(section) {
              var ccn = section.ccn;
              if (ccn_to_sites[ccn]) {
                section.sites = ccn_to_sites[ccn];
              }
            });
          }
        });
      });
    };

    var selectAllSections = function() {
      var newSelectedCourses = [];
      angular.forEach($scope.selectedCourses, function(course) {
        angular.forEach(course.sections, function(section) {
          section.selected = true;
        });
        newSelectedCourses.push(course);
      });
      $scope.selectedCourses = newSelectedCourses;
    };

    $scope.switchAdminSemester = function(semester) {
      angular.extend($scope, {
        current_admin_semester: semester.slug
      });
    };

    $scope.switchSemester = function(semester) {
      angular.extend($scope, {
        current_semester: semester.slug,
        selectedCourses: semester.classes
      });
    };

    $scope.toggleAdminMode = function() {
      var admin_mode;
      if ($scope.admin_mode === 'by_ccn') {
        admin_mode = 'act_as';
      } else {
        admin_mode = 'by_ccn';
      }
      clearCourseSiteJob();
      angular.extend($scope, {
        currentWorkflowStep: 'selecting',
        admin_mode: admin_mode,
        teaching_semesters: []
      });
    };

    $scope.fetchFeed();
  });

})(window.angular);
