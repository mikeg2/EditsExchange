require([
    'angular',
], function(angular) {

angular.module('genreItem', [])
    .directive('genreItem', function(URL) {
            return {
                restrict: 'AE',
                templateUrl: "/partials/genre-item",
                scope: {
                    me: "=",
                    genre: "=genreItem"
                },
                link: function(scope, elem, attr) {
                    scope.getUrlForGenre = URL.getURLForGenre;
                }
            };
        });

});