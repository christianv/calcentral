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
      isPublic: true
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
      controller: 'CampusController'
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
    when('/canvas/embedded/rosters', {
      templateUrl: 'canvas_embedded/roster.html'
    }).
    when('/canvas/embedded/course_provision_account_navigation', {
      templateUrl: 'canvas_embedded/course_provision.html',
      controller: 'CanvasCourseProvisionController'
    }).
    when('/canvas/embedded/course_provision_user_navigation', {
      templateUrl: 'canvas_embedded/course_provision.html',
      controller: 'CanvasCourseProvisionController'
    }).
    when('/canvas/embedded/user_provision', {
      templateUrl: 'canvas_embedded/user_provision.html',
      controller: 'CanvasUserProvisionController'
    }).
    when('/canvas/embedded/course_add_user', {
      templateUrl: 'canvas_embedded/course_add_user.html',
      controller: 'CanvasCourseAddUserController'
    }).
    when('/canvas/embedded/course_mediacasts', {
      templateUrl: 'canvas_embedded/course_mediacasts.html',
      isEmbedded: true
    }).
    when('/canvas/embedded/course_manage_official_sections', {
      templateUrl: 'canvas_embedded/course_manage_official_sections.html',
      controller: 'CanvasCourseManageOfficialSectionsController'
    }).
    when('/canvas/embedded/course_grade_export', {
      templateUrl: 'canvas_embedded/course_grade_export.html',
      controller: 'CanvasCourseGradeExportController'
    }).
    when('/canvas/rosters/:canvasCourseId', {
      templateUrl: 'canvas_embedded/roster.html'
    }).
    when('/canvas/course_provision', {
      templateUrl: 'canvas_embedded/course_provision.html',
      controller: 'CanvasCourseProvisionController'
    }).
    when('/canvas/user_provision', {
      templateUrl: 'canvas_embedded/user_provision.html',
      controller: 'CanvasUserProvisionController'
    }).
    when('/canvas/course_add_user/:canvasCourseId', {
      templateUrl: 'canvas_embedded/course_add_user.html',
      controller: 'CanvasCourseAddUserController'
    }).
    when('/canvas/course_mediacasts/:canvasCourseId', {
      templateUrl: 'canvas_embedded/course_mediacasts.html'
    }).
    // Redirect to a 404 page
    otherwise({
      templateUrl: '404.html',
      controller: 'ErrorController',
      isPublic: true
    });
  });
})(window.angular);
