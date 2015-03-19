require([
    'require',
    'angular',
    'ang/module/draft/draftDisplay',
    'ang/app/editDisplayers/commentBox',
    'ang/app/editDisplayers/displayerController',
    'ang/app/editDisplayers/displayControls',
    'ang/app/editDisplayers/commentDisplayer',
    'ang/app/editDisplayers/commentLikeService',
    'ang/app/editDisplayers/DOMManipulator',
    'ang/app/editDisplayers/editor',
    'ang/module/modal',
    'ang/app/editDisplayers/editEditor/autoSave',
    'ang/app/editDisplayers/editEditor/module',
    'angular-tipped'
], function(requireLocal, angular) {

angular.module('editEditorApp').controller('editEditorController', function($rootScope, URL, PureRestangular, $controller, $cookieStore, $timeout, $scope, PopupService, AutoSaver, CommentLikeService, $compile, APIDrafts, APIUsers) {
    $scope.getUrlForUser = URL.getURLForUser;
    $controller('displayerController', {
        $scope: $scope,
        $rootScope: $rootScope
    });

    $scope.save_state = "saved";
    $scope.$watchCollection('edit', function() {
        $scope.save_state = "saving";
    }, true);
    $scope.$on('commentModelChanged', function() {
        $scope.save_state = "saving";
    });
    var tinymceEditorCallback = $scope.tinymceEditorCallback;
    var saving = function() {
        $scope.save_state = "saving";
    };
    var saved = function() {
        $scope.save_state = "saved";
    };
    var error = function(err) {
        $scope.save_state = "error";
    };

    (function waitForNgInit(fnct) {
        $scope.$watch('draftID', function(newVal) {
            if (newVal !== undefined) {
                fnct();
            }
        });
    })(function onInit() {
        console.log("DRAFTID: " + $scope.draftID);
        var draftBase = APIDrafts.one($scope.draftID);
        draftBase.all('user-edits').get($scope.draftEditorID)
            .then(function(editREST) {
                editREST.getList('comments').then(function(commentsREST) {
                    editObject = editREST;
                    editObject.comments = commentsREST;
                    $scope.edit = editObject;
                    onEditLoaded();
                });
            });
        draftBase.get({
            populate: ['author']
        }).then(function(draft) {
            $scope.draft = draft;
        });
    });

    function onEditLoaded() {
        setupAutoSaver();
    }

    function setupAutoSaver() {
        AutoSaver.startAutoUpdater({
            saver: function(toSave, success, error) {
                toSave.put().then(function() {
                    toSave.customPUT(toSave.comments, 'comments').then(success, error);
                }, error);
            },
            saving: saving,
            saved: saved,
            error: error,
            autoDetectChange: false,
            timeout: 3000,
            stateCallback: function() {
                return $scope.edit;
            }
        });
        $scope.$watch('edit', function(newVal) {
            AutoSaver.stateChanged();
        }, true);
        $scope.$on('commentModelChanged', function() {
            AutoSaver.stateChanged();
        });
    }

    $scope.newComment = function() {
        id = CommentLikeService.newComment().id;
    };
    $scope.newLike = function() {
        CommentLikeService.newLike();
    };
    $scope.deleteComment = function(comment_id) {
        CommentLikeService.deleteComment(comment_id);
    };
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['editEditorApp']);
});

});