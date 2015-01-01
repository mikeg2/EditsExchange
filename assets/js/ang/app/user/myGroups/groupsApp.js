var groupsApp = angular.module('myGroupsApp', ['API', 'groupAdminPanel', 'modal', 'userInput', 'util', 'URLManager', 'groupItem']);

groupsApp.controller("mainController", function($scope, APIUsers) {
    $scope.loadGroups = function() {
        APIUsers.one($scope.user.id).getList("groups").then(function(groups) {
            $scope.user.groups = groups;
        });
    };
    $scope.loadGroups();
});

groupsApp.directive("newGroup", function(APIGroups) {
    return {
        templateUrl: "/partials/new-group-form",
        restrict: 'E',
        controller: function($scope) {
            $scope.GROUP_TYPES = ["public", "private", "secret"];
            function resetForm() {
                $scope.newGroup = {};
                $scope.users = [];
                $scope.attemptSubmit = false;
                if ($scope.newGroupForm) {
                    $scope.newGroupForm.$setPristine(true);
                }
            }
            resetForm();
            $scope.submit = function() {
                if (!$scope.newGroupForm.$valid) {
                    $scope.attemptSubmit = true;
                    return;
                }
                var data = {
                    name: $scope.newGroup.name,
                    description: $scope.newGroup.description,
                    type: $scope.newGroup.type,
                    admin: $scope.user.id,
                    tagStrings: $scope.newGroup.tags.split(/\s+,+\s+|,+\s+|\s+,+|,+/)
                        .filter(function(value) {
                            return value.length !== 0;
                        })
                };
                APIGroups.post(data)
                    .then(function(group) {
                        return APIGroups.one(group.id)
                            .all("invites").post($scope.users);
                    })
                    .then(function() {
                        $scope.modal.newGroupModal = false;
                        resetForm();
                        $scope.loadGroups();
                    });
            };
        }
    };
});