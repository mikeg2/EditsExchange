define([
'angular',
'ang/module/URLManager'
], function(angular) {

angular.module('draftItem', ['URLManager']).directive('draftItem',

    function(URL) {
        return {
            restrict: 'A',
            templateUrl: "/partials/draft-item",
            scope: {
                "draft": '=',
                "me": "=",
                "showDraftInfo": '&'
            },
            link: function(scope, element, attr) {
                scope.draftPageUrl = URL.getUrlForDraftPage(scope.draft.id);
                scope.loginUrl = URL.getLoginUrl();
                console.log("DRAFT: ", scope.draft.id, " ME: ", scope.me.id);
                scope.editingUrl = URL.getSafeUrlForEditEditor(scope.draft.id, scope.me.id);
                console.log("URL: ", scope.draftPageUrl, " FOR: ", scope.draft.id);
                if (scope.draft.genres === undefined) {
                    scope.draft.genres = scope.draft.getList('genres').$object;
                }
            }
        };
    }
);

});