require([
    'angular',
    'ngRoute',
    'ang/api/authAPI',
    'jquery'
], function (angular) {

var app = angular.module('loginApp', ['ngRoute', 'authAPI'])
.factory('LoginRedirect', function($window) {
    return {
        redirect: function(from) {
            if (from !== undefined) {
                $window.location.href = from;
            } else {
                $window.location.href = '/';
            }
        }
    };
}).config(function($routeProvider) {
        $routeProvider.when('/new', {
            templateUrl: '/partials/login-new',
            controller: 'newController'
        }).when('/', {
            templateUrl: '/partials/login-form',
            controller: 'formController'
        }).otherwise({
            redirectTo: '/'
        });
}).controller('formController', function($scope, Auth, LoginRedirect) {
    $scope.user = {
        username: "",
        password: " "
    };
    $scope.submit = function() {
        Auth.login($scope.user, function(response) {
            $scope.successMessage = response.successMessage;
            $scope.errors = [];
            console.log("HERE");
            LoginRedirect.redirect($scope.from);
        }, function(response) {
            $scope.errors = response.errors;
        });
    };
}).controller('newController', function($scope, Auth) {
    $scope.submit = function() {
        console.log("CALLED");
        Auth.registerLocal($scope.user, function(response) {
            console.log("WORKED: " + response);
            $scope.successMessage = response.successMessage;
            $scope.errors = [];
        }, function(response) {
            console.log("FAILED: " + JSON.stringify(response));
            $scope.errors = response.errors;
        });
    };
    $scope.errors = [];
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['loginApp']);
});


});