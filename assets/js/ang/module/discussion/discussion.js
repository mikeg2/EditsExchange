define([
'angular',
'ang/module/util',
'sails.io',
'ang/api/api'
], function(angular) {

angular.module('discussion', ['API', 'util', 'sails.io'])
.constant('DISCUSSION_URL_STUB', '/api/v0/discussions')
.factory('DiscussionFetcher', function(DISCUSSION_URL_STUB, $sailsSocket, APIUsers, $q, Util) {
    function listenForUpdates(discussion) {
        $sailsSocket.subscribe("discussion", function(message) {
            if (message.verb != "updated" || message.id !== discussion.id) {
                return;
            }
            discussion.addMessages(message.data.messages);
        });
    }
    var DiscussionFetcher =  {
        makeDiscussion: function(discussion, me) {
            var blankFunction = function() {};
            var self = this;
            discussion.url = DISCUSSION_URL_STUB + "/" + discussion.id;
            discussion.messagesUrl = discussion.url + "/messages";
            discussion.me = me;

            discussion.addMessages = function(messages) {
                discussion.messages = discussion.messages || [];
                for (var i = 0; i < messages.length; i++) {
                    console.log("ADD MESSAGE LOOP");
                    DiscussionFetcher.populateSender(messages[i]);
                    discussion.messages.push(messages[i]);
                }
                if (this.onUpdate) {
                    this.onUpdate();
                }
            };
            discussion.sendMessage = function(message) {
                console.log("SENDING: ", message, " TO: ", discussion.messagesUrl);
                $sailsSocket.post(discussion.messagesUrl, {
                    user: this.me.id,
                    text: message
                }).success(function() {
                    console.log("SEND MSG");
                });
            };
            return discussion;

        },

        populateSender: function(message) {
            this.populateSender.fetched = this.populateSender.fetched || {};
            if (!this.populateSender.fetched[message.sender]) {
                console.log("MESSAGE: ", message);
                this.populateSender.fetched[message.sender] = APIUsers.one(message.user).get().$object;
            }
            message.user = this.populateSender.fetched[message.sender];
        },

        fetchUpdatingDiscussion: function(user, discussionId) {
            var promiser = $q.defer();
            var self = this;
            var url = DISCUSSION_URL_STUB + "/" + discussionId;
            console.log(url);
            $sailsSocket.get(url)
                .then(function(response) {
                    var discussion = self.makeDiscussion(response.data, user);
                    listenForUpdates(discussion);
                    discussion.messages.forEach(function(message) {
                        DiscussionFetcher.populateSender(message);
                    });
                    promiser.resolve(discussion);
                    console.log("RESOLVED: ", discussion.messages);
                }, function(error) {
                    console.log("ERROR: ", error);
                });

            return promiser.promise;
        }
    };
    return DiscussionFetcher;
})
.constant('DISCUSSION_SHOW_TIME_AFTER', 3600000)
.directive('discussionDisplay', function(Util, $timeout, $filter, DiscussionFetcher, DISCUSSION_SHOW_TIME_AFTER) {
    return {
        templateUrl: "/partials/discussion",
        restrict: 'AE',
        replace: true,
        scope: {
            me: "=",
            discussionId: "=?",
            activate: "=?",
        },
        link: function(scope, element, attr) {
            scope.messageSender = {};

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
                    function fetchDiscussion() {
                        if (!scope.discussionId || !scope.me) {
                            return;
                        }
                        DiscussionFetcher.fetchUpdatingDiscussion(scope.me, scope.discussionId)
                            .then(function(discussion) {
                                scope.discussion = discussion;
                                scope.scrollToBottom();
                                scope.discussion.onUpdate = scope.scrollToBottom;
                            });
                    }
                    $timeout(function() {
                        fetchDiscussion();
                        scope.$watch("me", fetchDiscussion);
                        scope.$watch("discussionId", fetchDiscussion);
                    }, 10);
                })();
            }

        },
        controller: function($scope) {
            $scope.send = function(message) {
                $scope.discussion.sendMessage($scope.messageSender.message);
                $scope.messageSender.message = "";
            };
        }
    };
}).directive('messageWriter', function() {
    return {
        templateUrl: '/partials/discussion-message-writer',
        restrict: 'E',
        scope: {
            'message': '=ngModel'
        },
        replace: true,
        link: function(scope, elem, attr, ngModelController) {

        }
    };
})
.constant("LOAD_NUMBER", 10)
.directive('newDiscussion', function() {
    return {
        restrict: 'E',
        templateUrl: '/partials/new-discussion-form',
        replace: true,
        scope: {
            group: "=",
            me: "=",
            onSubmit: "&",
            onCreated: "&",
        },
        controller: function($scope, APIDiscussions, Util) {
            resetForm();
            $scope.submit = function() {
                if(!$scope.newDiscussionForm) {
                    return;
                } else if ($scope.newDiscussionForm.$invalid) {
                    $scope.attemptSubmit = true;
                    return;
                }
                $scope.onSubmit();
                console.log({
                        text: $scope.newDiscussion.firstPostText,
                        user: $scope.me,
                    }
                );
                APIDiscussions.post({
                    group: $scope.group.id,
                    topic: $scope.newDiscussion.topic,
                    firstPost: {
                        text: $scope.newDiscussion.firstPostText,
                        user: $scope.me.id,
                    }
                }).then(function(group) {
                    resetForm();
                    $scope.onCreated({
                        $newGroup: group
                    });
                });
            };

            function resetForm() {
                $scope.newDiscussion = {};
                if ($scope.newDiscussionForm) {
                    $scope.newDiscussionForm.$setPristine(true);
                }
            }
        }
    };
});


});