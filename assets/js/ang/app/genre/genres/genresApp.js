require([
    'angular',
    'ang/module/userInput',
    'ang/module/modal',
    'ang/module/genre/genreItem',
    'ang/module/util',
    'ang/module/URLManager'
], function(angular) {

angular.module('genresApp', ['API', 'modal', 'util', 'URLManager', 'genreItem'])
    .controller("searchGenres", function($scope, $rootScope, APIGenres) {
        //TODO refactor with Require.js
        $scope.$watch('searchTerm', function(newValue) {
            if (!isSearchValid($scope.searchTerm)) {
                $scope.searchResults = [];
                return;
            }
            searchFor(newValue).then(function(result) {
                $scope.searchResults = result;
            });
        });

        function searchFor(string) {
            return APIGenres.getList({
                where: {
                    or: [
                            {
                                name: {contains: string},
    //                          tagStrings: {contains: string} // TODO get tag string search working for this and drafts
                            },
                            {
                                description: {contains: string},
                            }
                        ]
                    }
            });
        }

        $scope.$watch('searchTerm', function setSearching(newValue) {
            if ($scope.searchTerm && $scope.searchTerm.length > 0) {
                $rootScope.searching = true;
            } else {
                $rootScope.searching = false;
            }
        });

        $scope.$watch('searchTerm', function setLongEnoguh(newValue) {
            if (isSearchLongEnough($scope.searchTerm)) {
                $scope.longEnough = true;
            } else {
                $scope.longEnough = false;
            }
        });

        $scope.searchTerm = ""; // Triggers first sync 

        function isSearchValid(searchTerm) {
            return isSearchLongEnough(searchTerm);
        }


        function isSearchLongEnough(searchTerm) {
            if (searchTerm && searchTerm.length > 3) {
                return true;
            }
            console.log("Search term: ", searchTerm);
            return false;
        }
    })
    .controller('favoriteGenres', function($scope, APIUsers) {
        $scope.favoriteGenres = APIUsers.one($scope.user.id).getList('favoriteGenres', {
            limit: 4
        }).$object;
    })
    .controller('allGenres', function($scope, APIGenres) {
        $scope.allGenres = APIGenres.getList({
            sort: 'name'
        }).$object;
    });

angular.element(document).ready(function() {
  angular.bootstrap(document, ['genresApp']);
});

});