require([
    'angular',
    'ang/module/draft/draftDisplay',
    'ang/module/modal',
    'ang/module/stepScroll',
    'ang/module/draft/draftDisplay',
    'ang/module/draft/draftItem',
], function(angular) {

var exchangeApp = angular.module("exchangeApp", ['API', 'draftItem', 'draftDisplay', 'modal', 'stepScroll']);
exchangeApp
    .constant("INITIAL_LOAD", 9)
    .controller("GenreListsController", function($scope, $controller, $rootScope, $timeout, $q, APIGenres, APIUsers, INITIAL_LOAD) {
        $controller('draftShower', {
            $scope: $scope,
            $rootScope: $rootScope,
        });
        var oldShowDraft = $scope.showDraft;
        $scope.showDraft = function(draft) {
            if (typeof draft.author == "string") {
                console.log("FETCHING AUTHOR");
                var promise = APIUsers.one(draft.author).get();
                draft.author = promise.$object;
                promise.then(function(auth) {
                    console.log("AUTH: ", auth);
                });
            }
            oldShowDraft(draft);
        };
        (function fetchGenreLists() {
            var featuredGenres = ['ctmp', 'flfi', 'sify'];
            $scope.genreLists = [];

            function getRESTFeaturedGenres() {
                var genres = [];
                for (var i = 0; i < featuredGenres.length; i++) {
                    var genre = APIGenres.one(featuredGenres[i]);
                    genres.push(genre);
                }
                return genres;
            }

            var RESTFeaturedGenres = getRESTFeaturedGenres();
            for (var i = 0; i < RESTFeaturedGenres.length; i++) {
                var genreList = getGenreListForGenre(RESTFeaturedGenres[i]);
                $scope.genreLists.push(genreList);
            }

            function getGenreListForGenre(genre) {
                var initialLoad = INITIAL_LOAD;
                return {
                    genre: genre.get().$object,
                    drafts: genre.getList("drafts", {
                        limit: initialLoad
                    }).$object,
                    loadNext: function(number) {
                        var promiser = $q.defer();
                        var self = this;
                        genre.getList("drafts", {
                            limit: number,
                            skip: self.drafts.length,
                        }).then(function(newDrafts) {
                            self.drafts = self.drafts.concat(newDrafts);
                            $timeout(promiser.resolve, 10);
                        });
                        return promiser.promise;
                    }
                };
            }
        })();
    });

angular.element(document).ready(function() {
  angular.bootstrap(document, ['exchangeApp']);
});

});