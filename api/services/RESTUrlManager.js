var BASE_URL = '/api/v0';

exports.getUrlForDraft = function(draft_id) {
    return BASE_URL + "/drafts/" + draft_id;
};

exports.getUrlForAllUsers = function(user_id) {
    return BASE_URL + "/users";
};

exports.getUrlForUser = function(user_id) {
    return exports.getUrlForAllUsers() + "/" + user_id;
};

exports.getUrlForEdit = function(edit_id) {
    return BASE_URL + "/edits/" + edit_id;
};

exports.getUrlForEditByUser = function(draft_id, user_id) {
    return BASE_URL + "/drafts/" + draft_id + "/user-edits/" + user_id;
};

exports.getUrlForGenre = function(genre_id) {
    return exports.getUrlForAllGenres() + "/" + genre_id;
};

exports.getUrlForAllGenres = function() {
    return BASE_URL + "/genres";
};

exports.getUrlForTag = function(tag_id) {
    return BASE_URL + "/tags/" + tag_id;
};

exports.getUrlForAllChats = function() {
    return BASE_URL + "/chats";
};

exports.getUrlForChat = function(chat_id) {
    return exports.getUrlForAllChats() + "/" + chat_id;
};

exports.getUrlForAllGroups = function() {
    return BASE_URL + "/groups";
};

exports.getUrlForGroup = function(group_id) {
    return exports.getUrlForAllGroups() + "/" + group_id;
};

exports.getUrlForAllDiscussions = function() {
    return BASE_URL + "/discussions";
};

exports.getUrlForDiscussion = function(discussion_id) {
    return exports.getUrlForAllDiscussions() + "/" + discussion_id;
};