define([
'angular'
], function(angular) {

angular.module("stepScroll", [])
    .constant("SCROLL_BUFFER", 3)
    .directive("stepScroll", function($q, $interval, $timeout, SCROLL_BUFFER) {
        return {
            restrict: 'AE',
            replace: 'true',
            transclude: 'true',
            templateUrl: '/partials/step-scroll',
            scope: {
                "onScroll": "&",
                "loadNext": "&"
            },
            link: function(scope, elem, attrs) {
                scope.scrollBuffer = attrs.scrollBuffer || SCROLL_BUFFER;
            },
            controller: function($scope, $element) {
                $elem = $($element);
                $scope.fetchNext = function(howMany) {

                };

                //scroll
                $scope.scroll = function(howManyItemsRight, percentTotalWidth) {
                    var scrollRequested = calculateScrollInPixels({
                        items: howManyItemsRight,
                        percentTotalWidth: percentTotalWidth
                    });
                    scrollPixels(scrollRequested);
                };

                function beforeScrollAttempt(pixels, callback) {
                    $q.all([loadMoreIfNecessary(pixels)])
                        .then(callback);
                }

                function loadMoreIfNecessary(pixels) {
                    var promiser = $q.defer();
                    var maxScrollRight = calculateMaxScrollRight();
                    if (isScrollRight(pixels) && (pixels > maxScrollRight)) {
                        var scrollOver = pixels - maxScrollRight;
                        var itemsToLoad = Math.round(convertPixelsToItems(scrollOver)) + $scope.scrollBuffer;
                        console.log("LOAD NEXT: " + itemsToLoad + " WITH BUFFER: " + $scope.scrollBuffer);
                        $scope.loadNext({
                            numItems: itemsToLoad
                        }).then(promiser.resolve);
                    } else {
                        promiser.resolve();
                    }
                    return promiser.promise;
                }

                function isScrollRight(pixels) {
                    return pixels > 0;
                }

                function scrollPixels(pixels) {
                    beforeScrollAttempt(pixels, function() {
                        var scroll = maxOutScroll(pixels);
                        var scrollTo = getScrollRight() + scroll;
                        setScrollRight(scrollTo);
                        $scope.onScroll({
                            pixels: pixels
                        });
                    });
                }

                function calculateScrollInPixels(scrollTypes) {
                    var total = 0;
                    total += convertItemScrollToPixels(scrollTypes.items);
                    total += convertPercentTotalWidthInPixels(scrollTypes.percentTotalWidth);
                    return total;
                }
                var $track = $elem.children('.track');
                var $itemContainer = $track.children('.item-container');
                var $anItem = null;

                function getItemWidth() {
                    if (!$anItem) {
                        $anItem = $($itemContainer.children()[0]);
                    }
                    return $anItem.outerWidth(true);
                }

                function convertItemScrollToPixels(items) {
                    return getItemWidth() * items;
                }

                function convertPixelsToItems(pixels) {
                    return pixels / getItemWidth();
                }

                function convertPercentTotalWidthInPixels(percentTotalWidth) {
                    return $elem.width() * percentTotalWidth;
                }

                function maxOutScroll(scrollRequested) {
                    if (isScrollRight(scrollRequested)) {
                        var maxScrollRight = calculateMaxScrollRight();
                        console.log("MAX SCROLL RIGHT: " + maxScrollRight)
                        return scrollRequested > maxScrollRight ? maxScrollRight : scrollRequested;
                    } else {
                        var maxScrollLeft = -calculateMaxScrollLeft();
                        return scrollRequested < maxScrollLeft ? maxScrollLeft : scrollRequested;
                    }
                }

                function getScrollRight() {
                    return -parseInt($track.css('left'));
                }

                function setScrollRight(toPixels) {
                    return $track.css('left', -toPixels + "px");
                }

                $rightButton = $elem.children(".scroll-right");

                function calculateMaxScrollRight() {
                    return getTotalWidthOfElements() - $elem.width() - getScrollRight();
                    //return getScrollRight();
                }

                function getTotalWidthOfElements() {
                    var width = parseInt($itemContainer.css('padding-left')) + parseInt($itemContainer.css('padding-right'));
                    $itemContainer.children('li').each(function() {
                        width += $(this).outerWidth(true);
                    });
                    return width;
                }

                function calculateMaxScrollLeft() {
                    //return $itemContainer.width() - getScrollRight();
                    return getScrollRight();
                }
            }
        };
    });

});