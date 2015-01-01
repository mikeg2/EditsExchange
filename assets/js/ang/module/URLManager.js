define([
    'angular'
], function(angular) {

return angular.module('URLManager', []).factory('URL', function() {
    var URL = {
        getLoginUrl: function() {
            return "/auth";
        },
        getUrlForEditViewer: function(edit) {
            return "/edits/edit-viewer/edit/" + edit.id;
        },
        getUrlForEditEditor: function(draft, user) {
            return "/edits/edit-editor/draft/" + draft + "/user/" + user;
        },
        getSafeUrlForEditEditor: function(draft, user) {
            if (user) {
                return URL.getUrlForEditEditor(draft, user);
            }
            return URL.getLoginUrl() + ""; // need to add redirect funct.
        },
        getUrlForGroup: function(group) {
            return "/groups/" + group + "/group-page";
        },
        getUrlForUser: function(user) {
            return "/users/" + user + "/user-page";
        },
        getUrlForGenre: function(genre) {
            return "/genres/" + genre + "/genre-page";
        },
        getUrlForDraftPage: function(draft) {
            console.log("DRAFT: ", draft);
            return "/drafts/" + draft + "/draft-page";
        }
    };
    return URL;
});

});