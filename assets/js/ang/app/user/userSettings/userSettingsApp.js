require([
    'angular',
    'angular-file-upload',
    'ang/api/api'
], function(angular) {

var userSettingsApp = angular.module('userSettingsApp', ['API', 'ng', 'angularFileUpload']);

userSettingsApp.config(['$compileProvider',
    function($compileProvider) {
        var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
    }
]);

userSettingsApp.controller('userSettingsFormController', function($scope, $rootScope, APIUsers, transformFormDataWithFiles) {
    var userRESTReference;

    function retrieveUser() {
        userRESTReference.get().then(function(user) {
            $rootScope.user = user;
            $scope.userEditable = angular.copy($rootScope.user);
        });
    }

    (function waitForNgInit(fnct) {
        var cancel = $scope.$watch('user', function(newVal) {
            if (newVal !== undefined) {
                fnct();
                cancel();
            }
        });
    })(function() {
        userRESTReference = APIUsers.one($scope.user.id);
        $scope.userEditable = angular.copy($scope.user);
    });

    $scope.saveSettings = function() {
        $scope.errors = undefined;
        $scope.successes = undefined;
        userRESTReference.withHttpConfig({
            transformRequest: transformFormDataWithFiles
        }).customPUT($scope.userEditable, "", undefined, {
            'Content-Type': undefined
        }).then(function(resp) {
            if (resp == "OK") {
                $scope.successes = [{
                    msg: "Saved"
                }];
                retrieveUser();
            }
        }, function(err) {
            console.log(err);
            $scope.errors = err.data.errors;
        });
    };
    $scope.profilePictureHasChanged = false;
    $scope.pickProfilePicture = function(file) {
        file.url = URL.createObjectURL(file);
        $scope.userEditable.profilePicture = file;
    };

}).controller('userPasswordFormController', function($scope, $rootScope) {
    function clearForm() {
        $scope.oldPassword = $scope.newPassword = $scope.password2 = undefined;
        $scope.errors = undefined;
        $scope.successes = undefined;
    }
    $scope.changePassword = function() {
        if ($scope.newPassword != $scope.password2) {
            $scope.errors = [{
                msg: "Passwords do not match"
            }];
            return;
        }

        var objectToSend = {
            currentPassword: $scope.oldPassword,
            newPassword: $scope.newPassword
        };
        clearForm();
        $rootScope.user.customPUT(objectToSend, "password").then(function(response) {
            if (response == "OK") {
                $scope.successes = [{
                    msg: "Password Changed"
                }];
            }
        }, function(err) {
            $scope.errors = err.data.errors;
        });
    };
});


angular.element(document).ready(function() {
  angular.bootstrap(document, ['userSettingsApp']);
});

});