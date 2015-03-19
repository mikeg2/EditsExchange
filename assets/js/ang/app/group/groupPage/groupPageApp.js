require([
    'angular',
    'ang/module/userInput',
    'ang/module/modal',
    'ang/module/genre/genreItem',
    'ang/module/util',
    'ang/module/URLManager',
    'ang/module/group/groupAdminPanel',
    'ang/module/stepScroll',
    'ang/module/inviter',
    'ang/module/draft/draftItem',
    'ang/module/draft/draftDisplay',
    'ang/module/chat/chat',
    'ang/module/discussion/discussion',
    'angular-elastic',
    'angular-file-upload',
    'ang/module/util',
    'ang/module/user/userItem',
    'underscore'
], function(angular) {

var userPageApp = angular.module('groupPageApp', ['API', 'userItem', 'inviter','discussion', 'draftItem', 'draftDisplay', 'modal', 'chat', 'stepScroll', 'URLManager']);

userPageApp
.controller("mainController", function($scope, linkHashToVariable, $q, $controller, $rootScope, APIGroups, APIUsers) {
    $controller('draftShower', {
        $scope: $scope,
        $rootScope: $rootScope,
    });

    // (function linkDiscussionsToHash() {
    //     $scope.$watchCollection('group.discussions', function(newDiscussions, oldDiscussions) {
    //         var newItems = _.difference(newDiscussions, oldDiscussions);
    //         for (var i = newItems.length - 1; i >= 0; i--) {
    //             var discussion = newItems[i];
    //             var hash = "discussion-" + discussion.id;
    //             linkHashToVariable(hash, $scope, "modal.discussionToShow", {
    //                 'true': discussion,
    //                 'false': undefined // Hackish way to get modal to show at right time. Need revision?
    //             });
    //         }
    //     });
    // })();

    $scope.updateGroup = function($group) {
        $scope.group = $group;
    };

    (function waitForNgInit(fnct) {
        $scope.$watch('groupId', function(newVal) {
            if (newVal !== undefined) {
                fnct();
            }
        });
    })(function loadGroup() {
        var groupBase = APIGroups.one($scope.groupId);
        groupBase.get().then(function(group) {
            $rootScope.group = group;
            $rootScope.group.members = groupBase.getList('members').$object;
            $rootScope.group.discussions = groupBase.getList('discussions', {
                whitelist: ['id','topic', 'createdAt'],
            }).$object;
            $rootScope.group.activity = groupBase.getList('activity').$object;
            if ($scope.user) {
                isUserMemberOfGroup($scope.user.id, $rootScope.group.id)
                    .then(function(isMember) {
                        $rootScope.group.isMember = isMember;
                    });
            }
        });
        function isUserMemberOfGroup(userId, groupId) {
            return APIUsers.one(userId).getList('groups', {
                whitelist: ['id']
            }).then(function(groups) {
                return containsObjectWithParam(groups, 'id', groupId);
            });
        }
        function containsObjectWithParam(list, paramKey, val) {
            for (var i = list.length - 1; i >= 0; i--) {
                var item = list[i];
                if (item[paramKey] == val) {
                    return true;
                }
            }
            return false;
        }
    });

    (function showSettings() {

    })();
})
.controller("membersController", function($scope, URL, APIGroups) {
    $scope.getUrlForUser = URL.getURLForUser;
    $scope.join = function() {
        var membersBase = APIGroups.one($scope.group.id).all('members');
        membersBase.post({
            id: $scope.user.id
        }).then(function() {
            $scope.group.isMember = true;
        });
    };

    $scope.leave = function() {
        var membersBase = APIGroups.one($scope.group.id).all('members');
        membersBase.one($scope.user.id).remove().then(function() {
            $scope.group.isMember = false;
        });
    };
})
.controller("joinController", function($scope) {

})
.controller("inviteController", function() {

})
.controller("groupInviterController", function($scope, APIGroups) {
    var unregister = $scope.$watch('group', function(group) {
        if (group && group.id) {
            console.log("NEW INVITE OBJ");
            $scope.groupInviteObject = APIGroups.one($scope.group.id).all('invites');
            unregister();
        }
    }, true);
})
.constant("INITIAL_LOAD", 9)
.controller("infiniScrollController", function(APIGroups, INITIAL_LOAD, $scope, $q, $timeout){
    var unregister = $scope.$watch('group', function(group) {
        if (group === undefined) {
            return;
        }
        group.drafts = [];
        group.loadNextDrafts = function(number) {
            var promiser = $q.defer();
            group.getList("drafts", {
                limit: number,
                skip: group.drafts.length,
            }).then(function(newDrafts) {
                group.drafts = group.drafts.concat(newDrafts);
                $timeout(promiser.resolve, 10);
            });
            return promiser.promise;
        };
        group.loadNextDrafts(INITIAL_LOAD);
        unregister();
    });
})
.controller('subscriptionController', function(APIUsers, $scope) {
    var userPageBase = APIUsers.one($scope.userPageUserId);
    $scope.subscribe = function() {
        var myId = $scope.user.id;
        userPageBase.all('subscribers').post({
            id: myId
        }).then(function() {
            $scope.userPageUser.meta.imSubscribed = true;
        });
    };

    $scope.unsubscribe = function() {
        var mySubscription = userPageBase.all('subscribers').one($scope.user.id);
        mySubscription.remove().then(function() {
            $scope.userPageUser.meta.imSubscribed = false;
        });
    };
});


angular.element(document).ready(function() {
  angular.bootstrap(document, ['groupPageApp']);
});

});