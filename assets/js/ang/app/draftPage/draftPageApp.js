require([
    'angular',
    'ang/api/api',
    'ang/module/pageViewer',
    'jquery',
    'angular-sanatize',
    'tipped',
    'ang/module/modal',
    'ang/module/chat/chat',
    'ang/module/URLManager'
], function(angular) {

var appName = 'draftPageApp';
var app = angular.module(appName, ['API', 'pageViewer', 'ngSanitize', 'modal', 'chat', 'URLManager']);

app.config(function() {
    $.extend(Tipped.Skins, {
      'comment' : {
      }
    });
});

app.controller('main', function($scope, $sce, APIDrafts, APIEdits, URL) {
    (function waitForDraftId(cb) {
        $scope.$watch('draftId', cb);
    })(function fetchDraft(draftId) {
        var draftBase = APIDrafts.one(draftId);
        $scope.draft = draftBase.get({
            populate: ['author'],
        }).$object;
        $scope.draft.genres = draftBase.getList('genres').$object;
        draftBase.getList('edits', {
            populate: ['editor']
        }).then(function(response) {
            $scope.draft.edits = response;
            angular.forEach($scope.draft.edits, function(edit, indx) {
                edit.comments = APIEdits.one(edit.id).getList('comments').$object;
            });
        });
    });

    $scope.urls = URL;
})
.constant('EDIT_SELECTORS_TO_SUMMERIZE', ['insert', 'delete', '.comment'])
.directive('editItem', function($sce, EDIT_SELECTORS_TO_SUMMERIZE, URL){
    return {
        restrict: 'AE',
        templateUrl: '/partials/draft-edit-item',
        scope: {
            edit: '=editItem',
            user: '=?'
        },
        link: function(scope, element, attrs) {
            fillMissingElements(scope.edit);
            scope.edit.editSummery = $sce.trustAsHtml(summerizeEdit(scope.edit));
            scope.edit.content = $sce.trustAsHtml(scope.edit.content);
            scope.urls = URL;
        }
    };

    function fillMissingElements(edit) {
        if (!edit.editor.id) {
            edit.editor = APIUsers.one(edit.editor).get().$object;
        }
    }

    function summerizeEdit(edit) {
        var editHtmlBody = '<div>' + edit.content + '</div>';
        var $editElements = $(editHtmlBody).find(EDIT_SELECTORS_TO_SUMMERIZE.join(', '));
        var $wrapped = $editElements.wrap('<span class="edit-element"/>');
        return $('<div />').append($wrapped.parent()).html();
    }
})
.directive('editContentViewer', function() {
    return {
        restrict: 'A',
        template: '<div ng-bind-html="content || edit.content"></div>',
        scope: {
            edit: '=editContentViewer',
            content: '=?'
        },
        link: function(scope, element, attr) {
            $element = $(element);
            function linkComments() {
                 angular.forEach(scope.edit.comments, function(comment, key) {
                    console.log("COMMENT: ", comment);
                    var commentTextIdentifier = ".comment[data-id='" + comment.id + "']";
                    Tipped.create(commentTextIdentifier, comment.text, {
                        behavior: 'mouse',
                        skin: 'comment'
                    });
                });
            }
            scope.$watchCollection('edit.comments', linkComments);
        }
    };
});


angular.element(document).ready(function() {
    angular.bootstrap(document, [appName]);
});

});