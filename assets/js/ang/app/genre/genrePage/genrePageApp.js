require([
    'angular',
    'ang/module/modal',
    'ang/module/draft/draftDisplay',
    'ang/module/stepScroll',
    'ang/module/inviter',
    'ang/module/genre/genreItem',
    'ang/module/draft/draftItem',
    'ang/module/chat/chat'
], function (angular) {

var genrePageApp = angular.module('genrePageApp', ['API', 'genreItem', 'modal', 'draftItem', 'draftDisplay', 'modal', 'chat', 'stepScroll', 'genreItem', 'URLManager']);

genrePageApp
.controller("mainController", function($scope, $q, $controller, $rootScope, APIGenres, APIUsers) {
    $controller('draftShower', {
        $scope: $scope,
        $rootScope: $rootScope,
    });

    (function waitForNgInit(fnct) {
        $scope.$watch('genreId', function(newVal) {
            if (newVal !== undefined) {
                fnct();
            }
        });
    })(function loadGenre() {
        var genreBase = APIGenres.one($scope.genreId);
        genreBase.get().then(function(genre) {
            $rootScope.genre = genre;
        });
    });
})
.constant("INITIAL_LOAD", 9)
.controller("infiniScrollController", function(APIGenres, INITIAL_LOAD, $scope, $q, $timeout){
    var unregister = $scope.$watch('genre', function(genre) {
        genre.drafts = [];
        genre.loadNextDrafts = function(number) {
            var promiser = $q.defer();
            genre.getList("drafts", {
                limit: number,
                skip: genre.drafts.length,
                blacklist: ['content']
            }).then(function(newDrafts) {
                genre.drafts = genre.drafts.concat(newDrafts);
                $timeout(promiser.resolve, 10);
            });
            return promiser.promise;
        };
        genre.loadNextDrafts(INITIAL_LOAD);
        unregister();
    });
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['genrePageApp']);
});

});