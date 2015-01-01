define([
    'angular',
    './editDisplayers',
    'jquery'
], function(angular) {
    angular.module('editDisplayers').controller('displayerController', function($scope, ipCookie, $rootScope, $timeout, PopupService, CommentLikeService) {
        (function loadCookies() {
            $rootScope.editorSettings = ipCookie('editorSettings') || {};
            $rootScope.$watch('editorSettings', function(value) {
                ipCookie('editorSettings', value, {
                    path: '/edits'
                });
            }, true);
        })();
        (function setUpCommentSystem() {
            var getIframeForTinymce = function(tinymce) {
                return $("#" + tinymce.id + "_ifr");
            };
            var getRangeObjectForComment = $scope.getRangeObjectForComment = function(comment) {
                tinymceIframeID = getIframeForTinymce(tinymceEditorCallback());
                $tinymcebody = tinymceIframeID.contents().find('body');
                console.log("TINYMCE BODY: " + $tinymcebody.length);
                console.log("FINDING: " + '.range[data-id="' + comment.id + '"]');
                return $tinymcebody.find('.range[data-id="' + comment.id + '"]');
            };
            var tinymceEditorCallback = $scope.tinymceEditorCallback = function() {
                return tinymce.activeEditor;
            };
            (function setUpCommentModel() {
                var editObjectCallback = function() {
                    return $scope.edit;
                };

                CommentLikeService.config({
                    rangeClass: "range",
                    editObjectCallback: editObjectCallback,
                    tinymceEditorCallback: tinymceEditorCallback,
                    onCommentAdded: function(comment) {
                        console.log("COMMENT ADDED");
                        $rootScope.$broadcast('commentAdded', comment);
                    },
                    onCommentDeleted: function(comment) {
                        $rootScope.$broadcast('commentDeleted', comment);
                    },
                    onModelChange: function() {
                        $rootScope.$broadcast('commentModelChanged');
                        $rootScope.$broadcast('editorDOMChanged'); // Some model changes use JQuery to change DOM
                    },
                    getRangeObjectForComment: $scope.getRangeObjectForComment
                });
            })();
            (function setUpCommentBoxDisplayEvents() {
                $scope.$on('commentAdded', function(event, comment) {
                    $scope.commentEditor.activeComment = comment;
                });
                var origin = $scope.origin = {
                    x: 0,
                    y: 0
                };

                (function setUpPopupAutoHide() {
                    PopupService.activateAutoHide($scope);
                    $scope.$on('editorScrolled', PopupService.manualAutoHide);
                    $scope.$on('editorClicked', PopupService.manualAutoHide);
                })();

                $rootScope.commentEditor = {
                    commentBox: {
                        show: false
                    }
                };
                $rootScope.$watch('commentEditor.activeComment', function setLocationForComment(comment) {
                    var unregisterEvent = $scope.$on('editorAutoScrolled', function() {
                        if (comment == undefined) {
                            return origin;
                        }
                        $range = getRangeObjectForComment(comment);
                        $tinymceIframe = getIframeForTinymce(tinymceEditorCallback());
                        frameposition = $tinymceIframe.offset();
                        position = $range.offset();
                        console.log("POSITION: " + JSON.stringify(position) + " FOR RANGE#s: " + $range.length);
                        window_position_y = position.top - $tinymceIframe.contents().find('body').scrollTop() + frameposition.top + $range.height() / 2;
                        window_position_x = position.left + frameposition.left + $range.width() / 2;
                        $rootScope.commentEditor.activeComment.location = {
                            x: window_position_x,
                            y: window_position_y
                        };
                        unregisterEvent();
                    });
                });
                $scope.$watch('commentEditor.activeComment', function setCommentBoxVisibility(comment) {
                    if (comment === undefined || comment.id == undefined) { // ID is best way to tell if it's not just an empty object
                        $scope.commentEditor.commentBox.show = false;
                    } else {
                        $scope.commentEditor.commentBox.show = false; // hide while scrolling
                        var unregisterEvent = $scope.$on('editorAutoScrolled', function() {
                            $timeout(function() { // ensures editorScrolled event is already fired.
                                $scope.commentEditor.commentBox.show = true;
                            }, 0);
                            unregisterEvent();
                        });
                    }
                });
                var deselectComment = function(show) {
                    if (!show && deselectComment.oldComment == $scope.commentEditor.activeComment) { // Only hide when no new comment has been chosen
                        $scope.commentEditor.activeComment = undefined;
                    } else if (!show) {
                        deselectComment.oldComment = undefined;
                    } else {
                        deselectComment.oldComment = $scope.commentEditor.activeComment;
                    }
                };
                $scope.$watch('commentEditor.commentBox.show', deselectComment);
            })();
        })();
    });
});