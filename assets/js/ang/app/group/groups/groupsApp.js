require([
    'angular',
    'angular-file-upload',
    'ang/module/userInput',
    'ang/module/modal',
    'ang/module/group/groupItem',
    'ang/module/group/groupAdminPanel',
    'ang/module/util',
    'ang/module/URLManager'
], function(angular) {

angular.module('groupsApp', ['API', 'groupAdminPanel', 'modal', 'util', 'URLManager', 'groupItem'])
    .controller("searchGroups", function($scope, $rootScope, APIGroups) {
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
            return APIGroups.getList({
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
    .controller('newGroups', function($scope, APIGroups) {
        $scope.newestGroups = APIGroups.getList({
            limit: 4,
            sort: 'createdAt DESC'
        }).$object;
    })
    .controller('randomGroups', function($scope, APIGroups, Restangular) {
        $scope.randomGroups = Restangular.allUrl('groups/random').getList({ // TODO find way to make service
            limit: 4,
        }).$object;
    });

angular.element(document).ready(function() {
  angular.bootstrap(document, ['groupsApp']);
});

});