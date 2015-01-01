var async = require('async');
var q = require('q');

exports.convertIdsToTitles = function(tagIds) {
    var deferredTitles = q.defer();
    async.map(tagIds, function(id, callback) {
        Tag.findOne(id).then(function(tag) {
            callback(null, tag.title);
        }, function(err) {
            callback(err, id);
        });
    }, function(err, result) {
        if (err) {
            deferredTitles.reject(err);
        } else {
            deferredTitles.resolve(result);
        }
    });
    return deferredTitles.promise;
};

exports.convertTitlesToIds = function(titles) {
    var deferredIds = q.defer();
    async.map(titles, function(title, callback) {
        Tag.find().where({
            title: title
        }).then(function(tags) {
            var tag = tags[0];
            if (tag == null) {
                Tag.create({
                    title: title
                }).then(function(tag) {
                    callback(null, tag.id);
                }, callback).fail(callback);
            } else {
                callback(null, tag.id);
            }
        }, function(err) {
            callback(err);
        });
    }, function(err, result) {
        if (err) {
            deferredIds.reject(err);
        } else {
            deferredIds.resolve(result);
        }
    });
    return deferredIds.promise;
};