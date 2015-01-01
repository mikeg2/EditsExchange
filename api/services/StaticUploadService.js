var q = require('q');
var fs = require('fs');

var STATIC_URL = exports.STATIC_URL = "/api/v0/static";
var STATIC_DIRECTORY = exports.STATIC_DIRECTORY = "static";

var getUrlForUserProfilePicture = exports.getUrlForUserProfilePicture = function(imageName) {
    return STATIC_URL + "/users/profile-pictures/" + (imageName || "");
};

var getDirectoryForUserProfilePicture = exports.getDirectoryForUserProfilePicture = function(imageName) {
    return STATIC_DIRECTORY + "/users/profile-pictures/" + (imageName || "");
};

var getUrlForGroupPicture = exports.getUrlForGroupPicture = function(imageName) {
    return STATIC_URL + "/groups/group-pictures/" + (imageName || "");
};

var getDirectoryForGroupPicture = exports.getDirectoryForGroupPicture = function(imageName) {
    return STATIC_DIRECTORY + "/groups/group-pictures/" + (imageName || "");
};

var createNewFileName = exports.createNewFileName = function(fileType) {
    return IDGenerator.createID(15) + fileType;
};

var getFileExtension = function(filename) {
    return "." + filename.split('.').pop();
};

var blobAdapter = require('skipper-disk')({

});

var saveAs = function(file) {
    var newName = createNewFileName(getFileExtension(file.filename));
    file.filename = newName;
    return newName;
};

exports.getUploader = function(to) {
    return blobAdapter.receive({
        saveAs: saveAs,
        dirname: to
    });
};