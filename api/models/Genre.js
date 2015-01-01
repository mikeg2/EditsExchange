/**
 * Genre
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var IDGenerator = require('../services/IDGenerator');
var SocketModelService = require('../services/SocketModelService');
var RESTService = require('../services/RESTService');
var util = require('util');

var model = module.exports = {

    attributes: {

        id: {
            type: 'string',
            primaryKey: true
        },

        name: {
            type: 'string',
            required: 'true'
        },

        description: {
            type: 'string'
        },

        drafts: {
            collection: 'draft',
            via: 'genres'
        },

        toREST: function() {
            var obj = this.toObject();
            obj.self = {
                link: RESTUrlManager.getUrlForGenre(obj.id),
            };
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        },
    },


};

IDGenerator.addIDtoModel(model, 4);