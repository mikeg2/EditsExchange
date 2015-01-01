/**
 * Tag
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var IDGenerator = require('../services/IDGenerator');
var RESTUrlManager = require('../services/RESTUrlManager');

var model = module.exports = {

    attributes: {
        id: {
            type: 'string',
            primaryKey: true,
        },

        title: {
            type: 'string',
            required: true
        },

        drafts: {
            collection: 'draft',
            via: 'tags'
        },

        groups: {
            collection: 'group',
            via: 'tags'
        }

    }

};

IDGenerator.addIDtoModel(model, 17);