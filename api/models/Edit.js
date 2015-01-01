/**
 * Edits
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var IDGenerator = require('../services/IDGenerator');
var SocketModelService = require('../services/SocketModelService');
var RESTService = require('../services/RESTService');
var RESTUrlManager = require('../services/RESTUrlManager');

var model = module.exports = {
    autoPK: false,
    attributes: {

        id: {
            type: 'string',
            primaryKey: true
        },


        comments: {
            collection: 'comment',
            via: 'edit'
        },

        overallComments: {
            type: 'string',
        },

        content: {
            type: 'string'
        },

        draft: {
            model: 'draft',
        },

        editor: {
            model: 'user'
        },

        toREST: function() {
            var objREST = this.toObject();
            objREST.self = {
                link: RESTUrlManager.getUrlForEdit(objREST.id),
            };
            objREST.lastEdited = this.updatedAt;
            objREST.firstEdited = this.createdAt;
            delete objREST.createdAt;
            delete objREST.updatedAt;
            return objREST;
        },
    },

    afterCreate: function(obj, next) {
        Events.about("edits").emit("create", obj);
        next();
    }

};

IDGenerator.addIDtoModel(model, 9);

SocketModelService.addAllLifecycleCallbacks(model, "Edit");