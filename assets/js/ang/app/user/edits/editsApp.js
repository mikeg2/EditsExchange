require([
    'angular',
    'ang/module/userInput',
    'ang/module/modal',
    'ang/module/genre/genreItem',
    'ang/module/util',
    'ang/module/URLManager',
    'ang/module/uploadToText',
    'ang/module/smartPaste',
    'ang/module/draft/draftItem',
    'ang/module/draft/draftDisplay',
    'ang/module/inviter',
    'angular-file-upload',
    'angular-fuse',
    'angular-sanatize'
], function(angular) {

var editsApp = angular.module('editsApp', ["URLManager", "ngSanitize", "API", "draftItem", "draftDisplay", "fuse", "modal", "smartPaste", "uploadToText", "angularFileUpload"]);

editsApp.controller('editListAreaController', function($scope, $rootScope, APIUsers, URL) {
    (function waitForNgInit(fnct) {
        $scope.$watch('user', function(newVal) {
            if (newVal !== undefined) {
                fnct();
            }
        });
    })(function getAllEditedDrafts() {
        $scope.drafts = {};
        $scope.user.editedDrafts = APIUsers.one($scope.user.id).getList('edited-drafts').$object;
    });
    $scope.getURLForEditEditor = URL.getURLForEditEditor;
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['editsApp']);
});

});