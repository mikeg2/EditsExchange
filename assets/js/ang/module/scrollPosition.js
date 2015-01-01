angular.module('scrollPosition', []).directive('scrollPosition',
    function() {
        return {
            scope: {
                scrollPosition: '='
            },
            link: function(scope, element, attr) {
                $element = $(element);
                function syncScroll() {
                    console.log("SCROLL POS: ", scope.scrollPosition);
                    $element.scrollTop(scope.scrollPosition);
                }
                syncScroll();
                scope.$watch('scrollPosition', syncScroll);
            }
        };
    }
);