define([
    'angular',
    './editDisplayers',
], function(angular) {
    angular.module('editDisplayers').directive('displayControls', function() {
        return {
            restrict: 'E',
            templateUrl: '/partials/edit-display-controls',
            replace: true,
            scope: {
                settings: "="
            },
            controller: function($scope) {
                var increment = 1.5;
                $scope.incrementFontSizePositive = function() {
                    $scope.settings.fontSize += increment;
                };

                $scope.incrementFontSizeNegative = function() {
                    $scope.settings.fontSize -= increment;
                };
            }
        };
    });
});