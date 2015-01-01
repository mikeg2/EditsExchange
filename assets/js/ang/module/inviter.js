define([
   'angular',
   './userInput'
], function(angular) {

angular.module('inviter', ["userInput"])
    .directive('inviter',
        function() {
            return {
                restrict: 'E',
                templateUrl: "/partials/inviter",
                replace: true,
                scope: {
                    restangular: "=?",
                    onSubmit: "&?"
                },
                link: function(scope, element, attr) {
                    scope.submit = function() {
                        sendInvites();
                        if (scope.onSubmit) {
                            console.log("ON SUBMIT");
                            scope.onSubmit();
                        }
                    };

                    function sendInvites() {
                        var sendTo = compileSendTo();
                        scope.restangular.post(sendTo);
                    }

                    function compileSendTo() {
                        var users = compileUsersAsSendTo();
                        var emails = compileEmailsAsSendTo();
                        return users.concat(emails);
                    }

                    function compileUsersAsSendTo() {
                        var sendTo = [];
                        var model = scope.users;
                        for (var i = 0; i < model.length; i++) {
                            var id = model[i].id;
                            sendTo.push({
                                id: id
                            });
                        }
                        return sendTo;
                    }

                    function compileEmailsAsSendTo() {
                        var sendTo = [];
                        var model = scope.emails;
                        for (var i = 0; i < model.length; i++) {
                            var email = model[i].emails;
                            sendTo.push({
                                email: email
                            });
                        }
                        return sendTo;
                    }
                }
            };
        }
    );

});