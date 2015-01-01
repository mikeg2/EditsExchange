/**
 * Comments
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var IDGenerator = require('../services/IDGenerator');
var SocketModelService = require('../services/SocketModelService');
var RESTService = require('../services/RESTService');

var model = module.exports = {

    attributes: {

        id: {
            type: 'string',
            primaryKey: true
        },

        edit: {
            model: 'edit'
        },

        text: {
            type: 'string'
        },

        toREST: function() {
            obj = this.toObject();
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    }

};