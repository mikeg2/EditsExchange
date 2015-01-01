define([
   'angular',
   'jquery'
], function(angular) {

return angular.module('modal', []).directive('modal', function() {
    return {
        restrict: 'E',
        templateUrl: "/partials/modal",
        transclude: true,
        replace: true,
        scope: {
            "show": '=',
            "title": '=',
            "thumbnail": '=',
            "modal": '=',
            "initialScrollPosition": '=?'
        },
        link: function(scope, element, attr) {
            $element = $(element);

            // scope.$watch('show', function(oldValue, show) {
            //     if (show === true) {
            //         scope.modal.stats.number_visible++;
            //     } else {
            //         scope.modal.stats.number_visible--;
            //     }
            // });
            scope.hideModal = function() {
                scope.show = false;
            };

            // Scroll Position
            scope.$watch('show', function(show) {
                $element.find('.modal-content').scrollTop(scope.initialScrollPosition);
            });
        }
    };
})
.config(function($locationProvider) {
    $locationProvider.html5Mode(false).hashPrefix('');
})
.factory('linkHashToVariable', function($location, $parse) {  // Should not be used with ngRoute
    return function (hashTag, scope, variableName, opt) {
        bindVariableToAnchor(hashTag, scope, variableName, opt || {});
        bindAnchorToVariable(hashTag, scope, variableName, opt || {});
    };

    function bindVariableToAnchor(hashTag, scope, variableName, opt) {
        var sync = function() {
            if (pageHasTag(hashTag)) {
                assignValueToScopeVariable(opt['true'] || true, scope, variableName);
            } else {
                assignValueToScopeVariable(opt['false'] || false, scope, variableName);
            }
        };
        sync();
        scope.$on('$locationChangeSuccess', sync);
    }

    function pageHasTag(tag) {
        return $location.hash() == tag;
    }

    function assignValueToScopeVariable(value, scope, variableName, opt) {
        var model = $parse(variableName);
        model.assign(scope, value);
        //scope.$apply();
    }

    function bindAnchorToVariable(hashTag, scope, variableName, opt) {
        var sync = function(newState) {
            if (newState == (opt['true'] || true)) {
                $location.hash(hashTag);
            } else {
                removeTag(hashTag);
            }
        };
        sync();
        scope.$watch(variableName, sync);
    }

    function removeTag(tag) {
        if (pageHasTag(tag)) {
            $location.hash("");
        }
    }
});

});