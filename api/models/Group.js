/**
 * Group
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var IDGenerator = require('../services/IDGenerator');
var Events = require('../services/Events');
var q = require('q');
var fs = require('fs');
var _ = require('lodash');

function collectActivityOfDrafts(group){
    console.log("COLLECT");
    return Draft.find({group: group.id}).populate('author')
        .then(function(drafts) {
            console.log("CALLED: ", drafts);
            return _.map(drafts, function(draft) {
                console.log("MAPPING");
                return {
                    what: draft.author.username + " posted " + draft.title,
                    at: draft.createdAt,
                };
            });
        }).fail(function(err) {
            console.log("COLL ACT DRAFTS: ", err);
        });
}

function collectActivityOfMembers(group){
    return q.fcall(function() {
        return [];
    });
}

function collectActivityOfDiscussions(group){
    return Discussion.find({group: group.id}).then(function(discussions) {
        return _.map(discussions, function(discussion) {
            return {
                what: "A discussion called " + discussion.topic + " was started",
                at: discussion.createdAt,
            };
        });
    });
}


var model = module.exports = {
    autoPk: false,
    attributes: {
        id: {
            type: 'string',
            primaryKey: true
        },

        name: {
            type: 'string'
        },

        description: {
            type: 'string',
        },

        tags: {
            collection: 'tag',
            via: 'groups'
        },

        type: {
            type: 'string',
            enum: ['secret', 'public', 'private']
        },

        // Photo/Profile picture
        groupPictureName: {
            type: 'string'
        },

        discussions: {
            collection: 'discussion',
            via: 'group'
        },

        admin: {
            model: 'user'
        },

        members: {
            collection: 'user',
            via: 'groups',
            dominant: true
        },

        drafts: {
            collection: 'draft',
            via: 'groups'
        },

        //Other
        random: {
            type: 'float'
        },

        collectActivity: function() {
            console.log("COLL ACTIVITY: ", self);
            var self = this;
            return q.all([
                    collectActivityOfDrafts(self),
                    collectActivityOfMembers(self),
                    collectActivityOfDiscussions(self),
                ]).spread(function(one, two, three) {
                    console.log("COLL ACT DONE");
                    return one.concat(two).concat(three);
                }).fail(function(err) {
                    console.log("COLL ACT ERROR: ", err);
                });
        },

        toRESTasync: function() {
            var defered = q.defer();
            var objREST = this.toObject();
            objREST.groupPicture = {
                url: StaticUploadService.getUrlForGroupPicture(objREST.groupPictureName)
            };
            objREST.lastActivity = objREST.updatedAt;
            TagService.convertIdsToTitles(this.tags || []).then(function(tagStrings) {
                objREST.tagStrings = tagStrings;
                delete objREST.createdAt;
                delete objREST.updatedAt;
                delete objREST.random;
                defered.resolve(objREST);
            }).fail(function(err) {
                defered.reject(err);
            });
            return defered.promise;
        }

    },

    beforeValidate: function(values, next) {
        if (!values.tagStrings) {
            return next();
        }
        TagService.convertTitlesToIds(values['tagStrings'])
            .then(function(tags) {
                values.tags = tags;
                delete values.tagStrings;

                // set group picture;
                var imageIsNotSet = values.groupPictureName === undefined;
                values.lastLogin = new Date();
                if (imageIsNotSet) {
                    Identicon.create(values.name).then(function(buffer) {
                        var imageName = StaticUploadService.createNewFileName('.png');
                        var urlForImage = StaticUploadService.getDirectoryForGroupPicture(imageName);
                        fs.writeFileSync(urlForImage, buffer);
                        values.groupPictureName = imageName;
                        next();
                    }).fail(function(err) {
                        console.log("GROUP BEFORE CREATE FAIL: ", err);
                    });
                } else {
                    next();
                }
            });
    },

    beforeCreate: function(values, next) {
        values['randomIndex'] = Math.random();
        next();
    },

    /* Only works when there are enough entries*/
    findRandom: function(num, where) {
        console.log("findRandom CALLED");
        var random = Math.random();
        where = where || {};
        where.randomIndex = {
            '>=': random
        };
        console.log("FINDING RANDOM WITH IND >= ", random);
        return Group
            .find(where)
            .limit(num)
            .then(function(foundRandom1) {
                console.log("Attempted to Find Random: ", foundRandom1);
                if (foundRandom1.length > num) {
                    return foundRandom1;
                } else {
                    where.randomIndex = {
                        '<': random
                    };
                    return Group
                        .find(where)
                        .limit(num).then(function(foundRandom2) {
                            return foundRandom2.length > foundRandom1.length ? foundRandom2 : foundRandom1;
                        });
                }
            });
    }

};

IDGenerator.addIDtoModel(model, 8);
