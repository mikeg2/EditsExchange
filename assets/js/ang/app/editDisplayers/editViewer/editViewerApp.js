define([
    'angular',
    './module',
    '../editDisplayers',
    'jquery',
    'sails.io',
    'sockets.io',
    '/modules/popup',
    'ngCookies',
    './editAutoUpdater'
], function(angular) {

var editViewerApp = angular.module('editViewerApp');

editViewerApp.controller('editViewerController', function($scope, $rootScope, $controller, EditAutoUpdater) {
    $controller('displayerController', {
        $scope: $scope,
        $rootScope: $rootScope,
    });
    (function waitForNgInit(fnct) {
        $scope.$watch('editID', function(newVal) {
            if (newVal !== undefined) {
                fnct();
            }
        });
    })(function setUpAutoUpdater() {
        var editId = $scope.editID;
        $scope.edit = EditAutoUpdater.startAutoUpdater({
            editId: editId,
            populate: 'editor, draft',
            onUpdated: function(newEdit) {
                $scope.edit = newEdit;
            },
        });
    });

});

});