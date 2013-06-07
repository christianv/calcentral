(function(angular) {

  'use strict';

  angular.module('calcentral.services').service('utilService', ['$location', '$scope', function($location, $scope) {

    var user = {};

    /**
     * Redirect to the settings page
     */
    var _redirectToSettingsPage = function() {
      $location.path('/settings');
    };

    /**
     * Redirect to the dashboard page
     */
    var _redirectToDashboardPage = function() {
      $location.path('/dashboard');
    };

    // Private methods that are only exposed for testing but shouldn't be used within the views

    /**
     * Set the user first_login_at attribute and redirect to the settings page
     */
    var _setFirstLogin = function() {
      user.profile.first_login_at = (new Date()).getTime();
      _redirectToSettingsPage();
    };

    /**
     * Handle the access to the page that the user is watching
     * This will depend on
     *   - whether they are logged in or not
     *   - whether the page is public
     */
    var _handleAccessToPage = function() {
      // Redirect to the login page when the page is private and you aren't authenticated
      if (!$route.current.isPublic && !user._isAuthenticated) {
        apiService.analytics.trackEvent(['Authentication', 'Sign in - redirect to login']);
        signIn();
      // Record that you've already visited the calcentral once and redirect to the settings page on the first login
      } else if (user._isAuthenticated && !user.profile.first_login_at) {
        apiService.analytics.trackEvent(['Authentication', 'First login']);
        $http.post('/api/my/record_first_login').success(_setFirstLogin);
      // Redirect to the dashboard when you're accessing the root page and are authenticated
      } else if (user._isAuthenticated && $location.path() === '/') {
        apiService.analytics.trackEvent(['Authentication', 'Redirect to dashboard']);
        _redirectToDashboardPage();
      }
    };

    /**
     * Set the current user information
     */
    var _handleUserLoaded = function(data) {
      user.profile = data;
      user._isLoaded = true;
      // Check whether the current user is authenticated or not
      user._isAuthenticated = user.profile && user.profile.is_logged_in;
      _handleAccessToPage();
    };

    /**
     * Get the actual user information
     */
    var _fetch = function(){
      $http.get('/api/my/status').success(_handleUserLoaded);
    };

    var enableOAuth = function(authorizationService) {
      apiService.analytics.trackEvent(['OAuth', 'Enable', 'service: ' + authorizationService]);
      window.location = '/api/' + authorizationService + '/request_authorization';
    };

    /**
     * Sign the current user in.
     */
    var signIn = function() {
      apiService.analytics.trackEvent(['Authentication', 'Redirect to login']);
      window.location = '/login';
    };

    /**
     * Remove OAuth permissions for a service for the currently logged in user
     * @param {String} authorizationService The authorization service (e.g. 'google')
     */
    var removeOAuth = function(authorizationService) {
      // Send the request to remove the authorization for the specific OAuth service
      // Only when the request was successful, we update the UI
      $http.post('/api/' + authorizationService + '/remove_authorization').success(function(){
        apiService.analytics.trackEvent(['OAuth', 'Remove', 'service: ' + authorizationService]);
        user.profile['has_' + authorizationService + '_access_token'] = false;
      });
    };

    /**
     * Sign the current user out.
     */
    var signOut = function() {
      $http.post('/logout').success(function(data) {
        if (data && data.redirect_url) {
          apiService.analytics.trackEvent(['Authentication', 'Redirect to logout']);
          window.location = data.redirect_url;
        }
      });
    };

    /**
     * Opt-out.
     */
    var optOut = function() {
      $http.post('/api/my/opt_out').success(function() {
        apiService.analytics.trackEvent(['Settings', 'User opt-out']);
        signOut();
      });
    };

    // Expose methods
    return {
      enableOAuth: enableOAuth,
      optOut: optOut,
      removeOAuth: removeOAuth,
      signIn: signIn,
      signOut: signOut
    };

  }]);

}(window.angular));
