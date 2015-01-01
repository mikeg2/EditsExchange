require([
    'angular',
    'ang/module/modal',
    'ang/module/draft/draftDisplay',
    'ang/module/draft/draftItem',
    'ang/module/chat/chat',
    'ang/module/stepScroll',
    'ang/module/user/userItem',
    'ang/module/group/groupItem',
    'ang/module/URLManager'
], function(angular) {

var userPageApp = angular.module('userPageApp', ['API', 'URLManager', 'groupItem', 'userItem', 'draftItem', 'draftDisplay', 'modal', 'chat', 'stepScroll']);

userPageApp.controller("mainController", function($scope, $q, $controller, $rootScope, APIUsers, URL) {
    $controller('draftShower', {
        $scope: $scope,
        $rootScope: $rootScope,
    });
    $scope.url = URL;

    (function waitForNgInit(fnct) {
        $scope.$watch('userPageUserId', function(newVal) {
            if (newVal !== undefined) {
                fnct();
            }
        });
    })(function loadUserPageUser() {
        var userPageBase = APIUsers.one($scope.userPageUserId);
        $scope.userPageUser = userPageBase.get().$object;
        $scope.userPageUser.drafts = userPageBase.getList('drafts', {
            populate: ['author']
        }).$object;
        $scope.userPageUser.favoriteGenres = userPageBase.getList('favoriteGenres', {
            limit: 3
        }).$object;
        $scope.userPageUser.subscriptions = userPageBase.getList('subscriptions').$object;
        $scope.userPageUser.groups = userPageBase.getList('groups').$object;

        amIsubscribedTo($scope.userPageUserId, APIUsers.one($scope.user.id))
            .then(function(amI) {
                $scope.userPageUser.meta = {
                    imSubscribed: amI
                };
            });

        function amIsubscribedTo(toId, userUrlLink) {
            var defer = $q.defer();
            console.log("WITH: ", toId, " AND: ", userUrlLink);
            userUrlLink.getList('subscriptions', {
                whitelist: ['id']
            }).then(function(subscriptions) {
                for (var i = 0; i < subscriptions.length; i++) {
                    var sub = subscriptions[i];
                    console.log("SUB: ", sub, " MY ID: ", toId);
                    if (sub.id == toId) {
                        return defer.resolve(true);
                    }
                }
                return defer.resolve(false);
            });
            return defer.promise;
        }
    });

    (function showSettings() {
        function isMyPage() {
            if ($scope.user && $scope.user.id == $scope.userPageUserId) {
                return true;
            }
            return false;
        }

        $scope.showSubscribeButton = function() {
            return !isMyPage();
        };

        $scope.showMessageButton = function() {
            return !isMyPage();
        };

    })();
}).controller('subscriptionController', function(APIUsers, $scope) {
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
  angular.bootstrap(document, ['userPageApp']);
});

});