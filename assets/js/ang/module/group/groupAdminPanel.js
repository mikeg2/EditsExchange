define([
   'angular',
   'ang/module/userInput',
   'angular-file-upload'
], function(angular) {

angular.module('groupAdminPanel', ['API', 'angularFileUpload', 'userInput'])
    .config(['$compileProvider',
        function($compileProvider) {
            var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
        }
    ])
    .directive('groupAdminPanel',
        function() {
            return {
                restrict: 'E',
                templateUrl: "/partials/group-admin-panel",
                replace: true,
                scope: {
                    group: "=",
                    onUpdate: "&",
                },
                link: function(scope, element, attr) {

                }
            };
        }
    ).controller('groupSettings', function($scope, $timeout, transformFormDataWithFiles, APIGroups) {
        var groupRESTReference = APIGroups.one($scope.group.id);
        groupPictureHasChanged = false;

        // (function waitForGroup(fnct) {
        //     var cancel = $scope.$watch('group', function(newVal) {
        //         if (newVal && newVal.id !== undefined) {
        //             fnct();
        //             cancel();
        //         }
        //     }, true);
        // })(function() {
            resetForm();
        // });

        $scope.saveSettings = function() {
            groupRESTReference.withHttpConfig({
                transformRequest: transformFormDataWithFiles
            }).customPUT($scope.groupEditable, "", undefined, {
                'Content-Type': undefined
            }).then(function(resp) {
                if (resp == "OK") {
                    $scope.successes = [{
                        msg: "Saved"
                    }];
                    $scope.onUpdate({
                        '$group': $scope.groupEditable
                    });
                    $timeout(resetForm);
                }
            }, function(err) {
                console.log(err);
                $scope.errors = err.data.errors;
            });
        };

        $scope.pickGroupPicture = function(file) {
            file.url = URL.createObjectURL(file); // will throw error if not valid file
            $scope.groupEditable.groupPicture = file;
        };

        function resetForm() {
            $scope.groupEditable = angular.copy($scope.group);
        }
    }).controller('groupAdmin', function($scope, $window, APIGroups) {
        var groupRESTReference = APIGroups.one($scope.group.id);
        $scope.isFormValid = function() { // calculated manually because of issues with "user-input" tag. TODO: Fix
            if ($scope.password && $scope.password.length > 0 && $scope.newAdmins.length == 1) {
                return true;
            }
            return false;
        };
        $scope.saveSettings = function() {
            if (!$scope.isFormValid()) {
                return;
            }
            groupRESTReference.all('admin').post({
                newAdmin: $scope.newAdmins[0].id,
                adminPassword: $scope.password
            }).then(function(success){
                $window.location.reload();
            }, function(err) {
                $scope.errors = err.data.errors;
            });
        };
    });

});




