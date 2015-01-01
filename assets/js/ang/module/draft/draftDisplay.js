define([
    'angular',
    'ang/api/api',
    'ang/module/URLManager'
], function(angular) {

angular.module('draftDisplay', ["URLManager", "API"]).directive('draftDisplay',
    function(URL, APIUsers) {
        return {
            restrict: 'E',
            templateUrl: "/partials/draft-display",
            transclude: true,
            replace: true,
            scope: {
                "draft": '=',
                "user": '='
            },
            link: function(scope, element, attr) {
                scope.$watch('draft', function(newDraft) {
                    if (newDraft !== undefined) {
                        if (scope.user !== undefined) {
                            console.log("AUTHOR: ", newDraft.author, "\nUSER: ", scope.user);
                            console.log("ID EQ: ", newDraft.author.id == scope.user.id);
                            newDraft.isUsers = newDraft.author.id == scope.user.id || newDraft.author == scope.user.id;
                        }
                        if (newDraft.author.username === undefined) {
                            APIUsers.one(newDraft.author.id || newDraft.author).get()
                                .then(function(author) {
                                    console.log("AUTHOR: ", author);
                                    scope.draft.author = author;
                                    console.log("SCOPE: ", scope.draft.author);
                                });
                        }
                    }
                }, true);
            },
            controller: function($scope, URL) {
                console.log("CONTROLLER");
                $scope.getURLForEditViewer = URL.getURLForEditViewer;
                $scope.getURLForEditEditor = URL.getURLForEditEditor;
                $scope.getURLForUser = URL.getURLForUser;
            }
        };
    }
).controller('draftShower', function($scope, $rootScope, APIDrafts) {
    var addEditsToDraft = function(draft) {
        draft.edits = APIDrafts.one(draft.id).getList('edits', {
            populate: 'editor'
        }).$object;
    };
    $scope.showDraft = function(draft) {
        if ($rootScope.modal === undefined) {
            $rootScope.modal = {};
        }
        addEditsToDraft(draft);
        $rootScope.modal.draftToShow = draft;
        $rootScope.modal.showDraftModal = true;
    };
});

});