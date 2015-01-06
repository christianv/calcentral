/**
 * Configure the routes for CalCentral
 */
(function(angular) {
  'use strict';

  // Set the configuration
  angular.module('calcentral.config').config(function($routeProvider) {
    // List all the routes
    $routeProvider.when('/', {
      templateUrl: 'splash.html',
      controller: 'SplashController',
      isPublic: true,
      title: 'Home'
    }).
    when('/academics', {
      templateUrl: 'academics.html',
      controller: 'AcademicsController',
      title: 'My Academics'
    }).
    when('/academics/semester/:semesterSlug', {
      templateUrl: 'academics_semester.html',
      controller: 'AcademicsController',
      title: 'My Academics'
    }).
    when('/academics/semester/:semesterSlug/class/:classSlug', {
      templateUrl: 'academics_classinfo.html',
      controller: 'AcademicsController',
      title: 'My Academics'
    }).
    when('/academics/booklist/:semesterSlug', {
      templateUrl: 'academics_booklist.html',
      controller: 'AcademicsController',
      title: 'My Academics - Book List'
    }).
    when('/academics/teaching-semester/:teachingSemesterSlug/class/:classSlug', {
      templateUrl: 'academics_classinfo.html',
      controller: 'AcademicsController',
      title: 'My Academics'
    }).
    when('/campus/:category?', {
      templateUrl: 'campus.html',
      controller: 'CampusController',
      title: 'Campus'
    }).
    when('/dashboard', {
      templateUrl: 'dashboard.html',
      controller: 'DashboardController',
      fireUpdatedFeeds: true,
      title: 'Dashboard'
    }).
    when('/finances', {
      templateUrl: 'myfinances.html',
      controller: 'MyFinancesController',
      title: 'My Finances'
    }).
    when('/finances/details', {
      templateUrl: 'cars_details.html',
      controller: 'MyFinancesController',
      title: 'My Finances - Details'
    }).
    when('/settings', {
      templateUrl: 'settings.html',
      controller: 'SettingsController',
      title: 'Settings'
    }).
    when('/tools', {
      templateUrl: 'tools_index.html',
      title: 'Tools'
    }).
    when('/tools/styles', {
      templateUrl: 'tools_styles.html',
      controller: 'StylesController',
      title: 'Tools - Styles'
    }).
    when('/uid_error', {
      templateUrl: 'uid_error.html',
      isPublic: true,
      title: 'Unrecognized Log-in'
    }).
    when('/canvas/embedded/course_manage_official_sections', {
      templateUrl: 'canvas_embedded/course_manage_official_sections.html',
      controller: 'CanvasCourseManageOfficialSectionsController',
      title: 'Manage Official Sections'
    }).
    when('/canvas/embedded/course_grade_export', {
      templateUrl: 'canvas_embedded/course_grade_export.html',
      controller: 'CanvasCourseGradeExportController',
      title: 'E-Grade Export'
    }).
    when('/canvas/rosters/:canvasCourseId' ||
         '/canvas/embedded/rosters', {
      templateUrl: 'canvas_embedded/roster.html',
      title: 'Roster Photos'
    }).
    when('/canvas/course_provision' ||
         '/canvas/embedded/course_provision_account_navigation' ||
         '/canvas/embedded/course_provision_user_navigation', {
      templateUrl: 'canvas_embedded/course_provision.html',
      controller: 'CanvasCourseProvisionController',
      title: 'bCourses Course Provision'
    }).
    when('/canvas/user_provision' ||
         '/canvas/embedded/user_provision', {
      templateUrl: 'canvas_embedded/user_provision.html',
      controller: 'CanvasUserProvisionController',
      title: 'bCourses User Provision'
    }).
    when('/canvas/course_add_user/:canvasCourseId' ||
         '/canvas/embedded/course_add_user', {
      templateUrl: 'canvas_embedded/course_add_user.html',
      controller: 'CanvasCourseAddUserController',
      title: 'bCourses Add User to Course'
    }).
    when('/canvas/embedded/course_mediacasts', {
      templateUrl: 'canvas_embedded/course_mediacasts.html',
      isEmbedded: true,
      title: 'Course Webcasts'
    }).
    when('/canvas/course_mediacasts/:canvasCourseId', {
      templateUrl: 'canvas_embedded/course_mediacasts.html',
      title: 'Course Webcasts'
    }).
    // Redirect to a 404 page
    otherwise({
      templateUrl: '404.html',
      isPublic: true,
      title: 'Error'
    });
  });
})(window.angular);
