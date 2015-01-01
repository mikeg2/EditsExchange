angular.module('newChat', ['ngTagsInput', 'util'])
    .constant("LOAD_NUMBER", 10)
    .directive('newChat', function() {
        return {
            restrict: 'E',
            template: '<tags-input id="users"\
                    display-property="username"\
                    add-from-autocomplete-only="true"\
                    replace-spaces-with-dashes="false"\
                    place-holder="Type in usernames"\
                    ng-model="selectedUsers">\
                        <auto-complete source="loadUsers($query)"></auto-complete>\
                    </tags-input>',
            replace: true,
            scope: {
                me: "=",
            },
            controller: function($scope, APIUsers, APIChats, Util) {

                function getCompleteUserSet() {
                    var array = angular.copy($scope.selectedUsers);
                    array.push($scope.me);
                    console.log("SELECTED USERS: " + JSON.stringify(array));
                    return array;

                }
            }
        };
    });