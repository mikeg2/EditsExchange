define([
    'angular',
    'ang/api/api',
    'ang/module/URLManager',
    'ang/module/util',
    'angular-elastic',
    'ngsails'
], function(angular) {

return angular.module('chat', ['API', 'util', 'sails.io', 'monospaced.elastic'])
    .constant('CHAT_URL_STUB', '/api/v0/chats')
    .factory('ChatFetcher', function(CHAT_URL_STUB, $sailsSocket, $filter, $q, Util) {
        function listenForUpdates(chat) {
            $sailsSocket.subscribe("chat", function(message) {
                if (message.verb != "updated" || message.id !== chat.id) {
                    return;
                }
                chat.addMessages(message.data.messages);
            });
        }
        return {
            makeChat: function(chat, me) {
                var blankFunction = function() {};
                chat.url = CHAT_URL_STUB + "/" + chat.id;
                chat.messagesUrl = chat.url + "/messages";
                chat.me = me;
                chat.addMessages = function(messages) {
                    for (var i = 0; i < messages.length; i++) {
                        chat.messages.push(messages[i]);
                    }
                    if (this.onUpdate) {
                        this.onUpdate();
                    }
                };
                chat.sendMessage = function(message) {
                    console.log("SENDING: ", message, " TO: ", chat.messagesUrl);
                    $sailsSocket.post(chat.messagesUrl, {
                        user: this.me.id,
                        text: message
                    }).success(function() {
                        console.log("SEND MSG");
                    });
                };
                return chat;

            },

            fetchUpdatingChatWithUsers: function(user, withUsers) {
                var promiser = $q.defer();
                var self = this;

                var completeUserSet = angular.copy(withUsers);
                completeUserSet.push(user);
                completeUserSet = Util.convertAllObjectsToIds(completeUserSet);
                console.log("PUSH USER");
                $sailsSocket.post(CHAT_URL_STUB, {
                    users: completeUserSet
                }).success(function(response) {
                    console.log("RESPONSE SOCKET: ", response);
                    var chat = self.makeChat(response, user);
                    listenForUpdates(chat);
                    promiser.resolve(chat);
                });

                return promiser.promise;
            },

            fetchUpdatingChat: function(user, chatId) {
                var promiser = $q.defer();
                var self = this;

                var url = CHAT_URL_STUB + "/" + chatId;
                console.log(url);
                $sailsSocket.get(url)
                    .success(function(response) {
                        var chat = self.makeChat(response, user);
                        listenForUpdates(chat);
                        promiser.resolve(chat);
                    });

                return promiser.promise;
            }
        };
    }).constant('CHAT_SHOW_TIME_AFTER', 3600000).directive('chatDisplay', function(Util, $timeout, $filter, ChatFetcher, CHAT_SHOW_TIME_AFTER) {
        return {
            templateUrl: "/partials/chat",
            restrict: 'AE',
            replace: true,
            scope: {
                me: "=",
                withUsers: "=?",
                activafte: "=?",
                chatId: "=?"
            },
            link: function(scope, element, attr) {
                var $elem = $(element);
                if (scope.activate || scope.activate === undefined) {
                    linkFnct();
                } else {
                    console.log("WAIT");
                    scope.$watch('activate', function(newValue) {
                        if (newValue) {
                            linkFnct();
                        }
                    });
                }

                function linkFnct() {
                    scope.Util = Util;
                    scope.scrollToBottom = function() {
                        $scrollElem = $elem.find('.message-container');
                        $timeout(function() {
                            $scrollElem.scrollTop(100000000000000);
                        });
                    };
                    (function setUpWithServer() {
                        function fetchChat() {
                            console.log("ME: ", scope.me, " CHAT ID: ", scope.chatId, " WITH USERS: ", scope.withUsers);
                            if (scope.me === undefined || (scope.chatId === undefined && (scope.withUsers === undefined || scope.withUsers.length === 0))) {
                                return;
                            }
                            console.log("FETCH CHAT");
                            var withUsers = scope.withUsers instanceof Array ? scope.withUsers : [scope.withUsers];
                            var chatPromise;
                            if (scope.chatId) {
                                console.log("FETCH UPDATING CHAT: " + scope.chatId);
                                chatPromise = ChatFetcher.fetchUpdatingChat(scope.me, scope.chatId);
                            } else {
                                chatPromise = ChatFetcher.fetchUpdatingChatWithUsers(scope.me, withUsers);
                            }
                            chatPromise.then(function(chat) {
                                scope.chat = chat;
                                scope.scrollToBottom();
                                scope.chat.onUpdate = scope.scrollToBottom;
                                console.log("CHAT: ", scope.chat);
                            });
                        }
                        $timeout(function() {
                            fetchChat();
                            scope.$watch("me", fetchChat);
                            if (scope.withUsers instanceof Array) {
                                scope.$watchCollection("withUsers", fetchChat);
                            } else {
                                scope.$watch("withUsers", fetchChat);
                            }
                            scope.$watch("chatId", fetchChat);
                        }, 10);
                    })();
                    scope.shouldAddTime = function(index) {
                        if (index === 0) {
                            return true;
                        } else if (index >= scope.chat.messages.length) {
                            return false;
                        }
                        var message = scope.chat.messages[index];
                        var lastMessage = scope.chat.messages[index - 1];
                        var timeDifference = Util.getMilliTimeDifferenceOfStrings(message.sentAt, lastMessage.sentAt);
                        if (timeDifference > CHAT_SHOW_TIME_AFTER) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                }

            },
            controller: function($scope) {
                $scope.send = function(message) {
                    $scope.chat.sendMessage($scope.message);
                    $scope.message = "";
                };
            }
        };
    });

});