define([
    'angular',
    './editDisplayers',
    'jquery',
    'lib/putCursorAtEnd.min'
], function(angular) {

editDisplayers = angular.module('editDisplayers');

// TODO Fix Node.js backend so it stops javascript from being embedded into the content
editDisplayers.directive('commentBox',
    function(PopupService, DOMManipulator) {
        return {
            restrict: 'E',
            templateUrl: "/partials/edit-comment-box",
            replace: true,
            scope: {
                "comment": '=',
                "onDelete": '&',
                "onHide": '&',
                "location": '=',
                "show": '='
            },
            link: function(scope, element, attr) {
                $element = $(element);
                (function readOnlyOption() {
                    var readOnly = scope.readOnly = attr.readOnly !== undefined;
                    if (readOnly) {
                        $element.find('#comment-entry-area').attr('readonly', true);
                    }
                })();
                console.log("LINK POPUP");
                var origin = 'top';
                scope.popup = PopupService.popPopup($element, {
                    x: location.x,
                    y: location.y,
                    origin: origin,
                    hideOthers: true,
                    onHide: function() {
                        scope.show = false;
                        console.log("SHOW: " + scope.show);
                    }
                });
                var setShow = function(show) {
                    console.log("NEW VALUE: " + show);
                    if (show) {
                        scope.popup.show(scope.location.x, scope.location.y, origin);
                        $element.find('#comment-entry-area').putCursorAtEnd();
                    } else {
                        scope.popup.hide();
                    }
                };
                setShow(scope.show);
                scope.$watch('show', setShow);
                scope.$watch('location', function(location) { // If already shown, reposition instead. Must be set after $scope.$watch('show'...)
                    if (popup.isVisible()) {
                        scope.popup.reposition(location.x, location.y, origin);
                    }
                });
            },
            controller: function($scope) {
                console.log("CONTROLLER");
                $scope.delete = function() {
                    if ($scope.readOnly) {
                        return;
                    }
                    $scope.popup.hide();
                    if ($scope.onDelete) {
                        $scope.onDelete();
                    }
                };
                $scope.hide = function() {
                    $scope.popup.hide();
                };
            }
        };
    }
);

});