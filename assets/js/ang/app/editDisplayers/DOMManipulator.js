define([
    'angular',
    './editDisplayers',
    'jquery',
    'jquery-smooth-scroll'
], function(angular) {
    angular.module('editDisplayers').factory('DOMManipulator', function() {
        var getObjectCenterScrollPosition = function($obj, $inObj) {
            $obj = $($obj);
            return $obj.offset().top + $inObj.scrollTop() - $obj.height() / 2;
        };
        var getIframeCenterScrollPosition = function($obj, $inObj) {
            $obj = $($obj);
            return $obj.position().top - $inObj.position().top + $inObj.scrollTop() - $obj.height() / 2;
        };
        function approxEq(val1, val2, diff) {
            return Math.abs(val1 - val2) <= diff;
        }
        return {
            centerInIframe: function(options) {
                this.centerIn(options, getIframeCenterScrollPosition);
            },
            centerInObject: function(options) {
                this.centerIn(options, getObjectCenterScrollPosition);
            },
            // centerIn: function(options, getCenterScrollPosition) {
            //     var $obj = $(options['toCenter']);
            //     $inObj = $(options['centerIn']);
            //     var scroll_height = getCenterScrollPosition($obj, $inObj) - (options['offset'] || 0);
            //     alert("");
            //     console.log($obj.attr('id'), ": Scroll Height: ", scroll_height, " Scroll Top: ", $inObj.scrollTop());
            //     if (approxEq(scroll_height, $inObj.scrollTop(), 2)) {
            //         if (options['onFinish']) {
            //             return options['onFinish'](false);
            //         }
            //         return;
            //     }
            //     $inObj.animate({
            //         scrollTop: "" + scroll_height + "px"
            //     }, {
            //         duration: options['length'],
            //         always: function() {
            //             if (options['onFinish']) {
            //                 options['onFinish'](true);
            //             }
            //         }
            //     });
            // },
            centerIn: function(options) {
                var $obj = $(options['toCenter']);
                var $inObj;
                if (options['centerIn']) {
                    $inObj = $(options['centerIn']);
                } else {
                    $inObj = $obj.parents('body, html').firstScrollable();
                }
                $.smoothScroll({
                    scrollElement: $inObj,
                    scrollTarget: $obj,
                    offset: -options['offset'],
                    afterScroll: options['onFinish'],
                    speed: options['duration'] || "auto",
                    autoCoefficient: options['speed'],
                });
            }
        };
    });
});