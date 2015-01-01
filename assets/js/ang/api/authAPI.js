define([
    'angular',
], function(angular) {

angular.module('authAPI', [])
    .constant('AUTH_API_BASE_URL', '/api/v0/auth')
    .factory('Auth', function($http, $rootScope, AUTH_API_BASE_URL) {
        return {
            login: function(user, success, error) {
                console.log("USER: " + JSON.stringify(user));
                $http.post(AUTH_API_BASE_URL + '/login', user).success(function(response) {
                    success(response);
                }).error(error);
            },

            logout: function(success, error) {
                $http.post(AUTH_API_BASE_URL + '/logout').success(function(response) {
                    $rootScope.user = undefined;
                    success(response);
                }).error(error);
            },

            isLoggedIn: function() {
                return $rootScope.user !== undefined;
            },

            registerLocal: function(user, success, error) {
                $http.post(AUTH_API_BASE_URL + '/register', user).success(success).error(error);
            }
        };
    });

});