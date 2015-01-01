define([
    'angular',
    './editDisplayers',
    'jquery',
    'pxem.JQuery',
    'jquery.browser.min',
], function(angular) {

angular.module('editDisplayers').directive('commentDisplayer', function(DOMManipulator) {
    return {
        restrict: 'E',
        replace: 'true',
        templateUrl: "/partials/edit-comment-displayer",
        scope: {
            "edit": "=",
            "commentEditor": "=",
        },
        link: function($scope, element, attr) {
            console.log("LINK!");
            var getCommentDisplayBoxForComment = function(comment) {
                return $(element).find('li[data-range-id="' + comment.id + '"]');
            };

            function locateComments() {
                for (var i = $scope.edit.comments.length - 1; i >= 0; i--) {
                    var comment = $scope.edit.comments[i];
                    var index = $scope.edit.content.indexOf('data-id="' + comment.id + '"'); // This is delicate. Error prone if other part of code changes
                    comment.locationInText = index;
                    console.log("COMMENT: ", comment);
                }
            }
            $scope.$watch('edit.comments.length', locateComments);
            locateComments();

            $scope.$watch('commentEditor.activeComment', function(newActiveComment) {
                if (newActiveComment === undefined) {
                    return;
                }
                displayBox = getCommentDisplayBoxForComment(newActiveComment);
                console.log("DISPLAY BOX: ", displayBox);
                DOMManipulator.centerInObject({
                    toCenter: displayBox,
                    centerIn: element,
                    time: 100
                });
            });
        },
        controller: function($scope) {
            $scope.getQuote = function(comment) {
                var $content = $($scope.edit.content);
                //$content.children().unwrap();
                var $comment = $content.find('.range[data-id="' + comment.id + '"]');
                return $comment.text();
            };
        }
    };
});

});