/**
 * Drafts
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var IDGenerator = require('../services/IDGenerator');
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

        group: {
            model: 'group',
            required: true
        },

        topic: {
            type: 'string'
        },

        messages: {
            collection: 'message',
            via: 'discussion'
        },

        toRESTasync: function() {
            var objREST = _.cloneDeep(this);
            objREST.self = {
                link: RESTUrlManager.getUrlForDiscussion(objREST.id),
            };
            return Message.find({
                discussion: objREST.id
            }).then(function(result) {
                return RESTService.RESTify(result);
            }).then(function(messages) {
                Object.defineProperty(objREST, 'messages', {
                    value: messages,
                    enumerable: true
                });
                console.log("DISC REST: ", objREST);
                return objREST;
            });
        }
    },

    afterCreate: function(obj, next) {
        Events.about("groups").emit("newDiscussion", obj);
        next();
    }


};

IDGenerator.addIDtoModel(model, 7);