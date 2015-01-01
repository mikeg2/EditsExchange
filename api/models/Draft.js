/**
 * Drafts
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var IDGenerator = require('../services/IDGenerator');
var SocketModelService = require('../services/SocketModelService');
var RESTService = require('../services/RESTService');
var RESTUrlManager = require('../services/RESTUrlManager');
var Events = require('../services/Events');
var q = require('q');

var model = module.exports = {
    autoPK: false,
    attributes: {

        id: {
            type: 'string',
            primaryKey: true
        },

        author: {
            model: 'user',
            required: true
        },

        genres: {
            collection: 'genre',
            required: true,
            via: 'drafts'
        },

        tags: {
            collection: 'tag',
            via: 'drafts'
        },

        title: {
            type: 'string',
            required: true
        },

        sample: {
            type: 'string',
            required: true,
        },

        content: {
            type: 'string',
            required: true
        },

        groups: {
            collection: 'group',
            via: 'drafts'
        },

        toRESTasync: function() {
            var objREST = this.toObject();
            var defered = q.defer();
            TagService.convertIdsToTitles(this.tags || []).then(function(tagStrings) {
                objREST.self = {
                    link: RESTUrlManager.getUrlForDraft(objREST.id),
                };
                objREST.tagStrings = tagStrings;
                objREST.publicationDate = objREST.createdAt;
                objREST.wordCount = StringStats.wordCountHTML(objREST['content']);
                delete objREST.createdAt;
                delete objREST.updatedAt;
                defered.resolve(objREST);
            }).fail(function(err) {
                difered.reject(err);
            });
            return defered.promise;
        }
    },

    afterCreate: function(obj, next) {
        Events.about("drafts").emit("create", obj);
        next();
    }


};

IDGenerator.addIDtoModel(model, 8);

SocketModelService.addAllLifecycleCallbacks(model, "Draft");