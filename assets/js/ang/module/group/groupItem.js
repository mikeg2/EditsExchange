define([
   'angular',
   'ang/module/modal',
   'ang/module/group/groupAdminPanel'
], function(angular) {

angular.module('groupItem', ['modal', 'groupAdminPanel']).directive("groupItem", function(APIUsers, APIGroups, URL) {
    return {
        templateUrl: "/partials/group-item",
        scope: {
            group: '=groupItem',
            me: '=?',
            onUpdate: '=?'
        },
        link: function(scope, elem, attr) {
            // Url
            scope.getURLForUser = URL.getURLForUser;
            scope.getURLForGroup = URL.getURLForGroup;

            scope.onUpdate = scope.onUpdate || function(a, b, c){};

            //Finish Group
            function tweakGroup() {
                var group = scope.group;
                if (!group) {
                    return;
                }
                if (!group.admin.username) {
                    group.admin = APIUsers.one(group.admin.id || group.admin).get().$object;
                }
                if (!group.members) {
                    APIGroups.one(group.id).getList("members", {
                        whitelist: ["username", "id"]
                    }).then(function(members){
                        group.members = members;
                    });
                }
            }
            tweakGroup();
        }
    };
});

});