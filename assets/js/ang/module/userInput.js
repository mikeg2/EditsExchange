define([
'angular',
'ang/api/api',
'ng-tags-input'
], function(angular) {

angular.module('userInput', ['ngTagsInput', 'API'])
    .constant("LOAD_NUMBER", 10)
    .directive('userInput', function() {
        return {
            restrict: 'E',
            template: '<tags-input\
                    display-property="username"\
                    add-from-autocomplete-only="true"\
                    replace-spaces-with-dashes="false"\
                    placeholder="Type in usernames"\
                    ng-model="ngModel"\
                    max-tags="{{ maxTags }}">\
                        <auto-complete source="loadUsers($query)"></auto-complete>\
                    </tags-input>',
            scope: {
                ngModel: "=",
                maxTags: "=?"
            },
            controller: function($scope, APIUsers) {
                $scope.loadUsers = function(query) {
                    console.log("QUERY: ", query);
                    return APIUsers.getList({
                        where: {
                            username: {
                                'startsWith': query
                            }
                        }
                    });
                };
            }
        };
    });

});