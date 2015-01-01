//TOOD Commit SailsJs with two new verbs, 'subscribe' and 'unsubscribe'
define([
    'angular',
    './module',
    './editDisplayers',
    'jquery'
], function(angular) {

angular.module('editViewerApp')
    .constant('EDIT_URL_STUB', '/api/v0/edits/')
    .factory('EditAutoUpdater',
        function(editFetcher, $sailsSocket) {
            var updatingObject = {};

            var emptyFunction = function() {};

            var makeCallbacksSafe = function(options) {
                options.onUpdated = options.onUpdated || emptyFunction;
                options.onUpdateStarted = options.onUpdateStarted || emptyFunction;
                options.onError = options.onError || emptyFunction;
            };

            var updateFetch = function(options) {
                options.onUpdateStarted();
                editFetcher.fetchEdit(options['editId'], options['populate']).then(function(edit) {
                    updatingObject = edit;
                    options.onUpdated(edit);
                });
            };

            // TODO Create less wastefull update API
            var addReactions = function(options) {
                $sailsSocket.subscribe("edit", function(message) {
                    console.log("MESSAGE: " + message);
                    if (message.verb != "updated") {
                        return;
                    }
                    updateFetch(options);
                });
            };

            return {
                options: undefined,
                startAutoUpdater: function(options) {
                    this.options = options;
                    makeCallbacksSafe(options);
                    updatingObject = editFetcher.fetchEditPromiseless(options['editId']);
                    addReactions(options);
                    return updatingObject;
                },

                changeEdit: function(newEditId) {
                    this.options['editId'] = newEditId;
                    alert("THIS FUNCTIONALITY IS NOT SUPPORTED RIGHT NOW");
                }

            };
        })
    .factory('editFetcher',
        function($sailsSocket, $q, EDIT_URL_STUB) {
            var getUrlForEditId = function(editId) {
                return EDIT_URL_STUB + editId;
            };
            var getUrlForEditComments = function(editId) {
                return getUrlForEditId(editId) + '/comments';
            };
            return {
                fetchEdit: function(editId, populate) {
                    var deffered = $q.defer();
                    var editUrl = getUrlForEditId(editId);
                    var commentsUrl = getUrlForEditComments(editId);
                    $q.all([$sailsSocket.get(editUrl+ "?populate=draft,editor", {
                        params: {
                            populate: populate
                        }
                    }), $sailsSocket.get(commentsUrl)])
                        .then(function(response) {
                            var edit = response[0].data;
                            edit.comments = response[1].data;
                            console.log("FETCHED: ", edit);
                            deffered.resolve(edit);
                        }, function(err) {
                            console.log("SOCKET ERR: " + err);
                            deffered.reject();
                        });
                    return deffered.promise;
                },
                fetchEditPromiseless: function(editId) {
                    toFill = {};
                    this.fetchEdit(editId).then(function(edit) {
                        angular.copy(edit, toFill);
                    }, function(err) {

                    });
                    return toFill;
                }
            };
        });

});