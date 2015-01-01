define([
    'angular',
    './popupService'
], function(angular) {

angular.module('popup').directive('popupBox',
    function(Locator, PopupService) {
        return {
            scope: {
                show: '='
            },
            link: function(scope, element, attr) {
                console.log("LINK POPUP: " + scope.show);
                $element = $(element);
                var popup = PopupService.popPopup($element, {
                    onHide: function() {
                        scope.show = false;
                        console.log("HIDE: ");
                    }
                });
                var shouldShow = function(newValue, oldValue) {
                    console.log("SHOW?");
                    if (newValue) {
                        var pos = Locator.getCenterPosition($(attr.anchor));
                        popup.show(pos.x, pos.y, attr.direction);
                    } else {
                        popup.hide();
                    }
                };
                shouldShow(scope.show);
                scope.$watch('show', shouldShow, true);
            }
        };
    }
);

angular.module('popup').factory('Locator', function() {
    return {
        getCenterPosition: function(obj) {
            $obj = $(obj);
            var offset = $obj.offset();
            var width = $obj.width();
            var height = $obj.height();

            var centerX = offset.left + width / 2;
            var centerY = offset.top + height / 2;
            return {
                x: centerX,
                y: centerY
            };
        }
    };
});

});