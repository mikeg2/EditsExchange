require([
    'angular',
    'ang/module/chat/chat',
    'ang/module/modal',
    'ang/module/userInput',
    'ang/module/util'
], function(angular) {

var messagesApp = angular.module('messagesApp', ['API', 'modal', 'chat', 'userInput', 'util']);

messagesApp.controller("mainController", function($scope, $controller, $rootScope, APIUsers) {
    (function waitForNgInit(fnct) {
        $scope.$watch('userPageUserId', function(newVal) {
            if (newVal !== undefined) {
                fnct();
            }
        });
    })(function loadUserPageUser() {
        var userBase = APIUsers.one($scope.userPageUserId);
        $scope.userPageUser = userBase.get().$object;
        $scope.userPageUser.drafts = userBase.getList('drafts').$object;
        $scope.userPageUser.favoriteGenres = userBase.getList('favoriteGenres').$object;

    });
});

messagesApp.controller('chatListController', function($scope, $rootScope, APIUsers, APIChats, $q) {
    $rootScope.chatDisplay = {};
    $scope.getChats = function() {
        $scope.user.chats = APIUsers.one($scope.user.id).getList('chats', {
            blacklist: ['messages']
        }).$object;
    };
    (function waitForInit(fnct) {
        $scope.$watch('user', fnct);
    })($scope.getChats);

    (function updateChatEvents() {
        $rootScope.$on('chatCreated', function(event, chat) {
            console.log("CHAT ID: ", chat);
            APIChats.one(chat.id).get({
                blacklist: ['messages']
            }).then(function(chat) {
                $scope.user.chats.push(chat);
                $scope.modal.showNewChat = false;
                $scope.chatDisplay.selectedChat = chat;
                console.log("NEW CHAT PUSHED");
            });
        });
    })();

    // FIX extreem ineffeciency
    (function loadChatExtras() {
        function getNameOfOtherUser(id, chat) {
            for (var i = 0; i < chat.users.length; i++) {
                if (chat.users[i] !== id) {
                    return chat.users[i];
                }
            }
        }

        cachedUsers = {};

        function getUser(id) {
            var promiser = $q.defer();

            console.log("SEARCH: ", id, " IN: ", cachedUsers);
            if (cachedUsers[id]) {
                promiser.resolve(cachedUsers[id]);
            } else {
                APIUsers.one(otherUserId).get().then(function(user) {
                    cachedUsers[id] = user;
                    promiser.resolve(user);
                });
            }

            return promiser.promise;
        }

        function addThumbnailOfChat(chat) {
            if (chat.display.thumbnail) {
                return;
            }
            otherUserId = getNameOfOtherUser($scope.user.id, chat);
            console.log("OTHER USER ID: ", otherUserId);
            getUser(otherUserId).then(function(user) {
                console.log("USER: ", user);
                chat.display.thumbnail = user.profilePicture.url;
            });
        }

        function addNameOfChat(chat) {
            if (chat.display.name) {
                return;
            }
            otherUserId = getNameOfOtherUser($scope.user.id, chat);
            getUser(otherUserId).then(function(user) {
                chat.display.name = user.username;
            });
        }

        $scope.$watchCollection('user.chats', function(newValue, oldValue) {
            console.log("CHAT CHANGE");
            for (var i = 0; i < newValue.length; i++) {
                var chat = newValue[i];
                if (!chat.display) {
                    chat.display = {};
                }
                addThumbnailOfChat(chat);
                addNameOfChat(chat);
            }
        }, true);
    })();
});

messagesApp.controller("newChatController", function($scope, APIChats, Util) {
    function getCompleteUserSet() {
        var array = angular.copy($scope.selectedUsers);
        array.push($scope.user);
        console.log("SELECTED USERS: " + JSON.stringify(array));
        return array;

    }

    // TODO: add in more user friendly errors
    $scope.startChat = function() {
        var userIds = Util.eliminateDuplicates(
            Util.convertAllObjectsToIds(
                getCompleteUserSet())
        );
        if (userIds.indexOf($scope.me) !== -1) {
            return alert("You can't talk to yourself");
        }
        if (userIds.length > 2) {
            alert("Chats with more than one user not yet supported");
            return;
        }
        if (true) {};
        APIChats.post({
            users: userIds
        }).then(function(chat) {
            $scope.selectedUsers = [];
            $scope.$emit('chatCreated', chat);
        });
    };
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['messagesApp']);
});

});