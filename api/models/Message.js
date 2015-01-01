/**
 * Message
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
var _ = require('lodash');
var q = require('q');

var makeREST = function(obj) {
    var objREST = _.cloneDeep(obj);
    objREST.sentAt = obj.createdAt;
    delete objREST.chat;
    delete objREST.createdAt;
    delete objREST.updatedAt;
    delete objREST.id;
    return objREST;
};

var model = module.exports = {

    attributes: {

        chat: {
            model: 'chat',
        },

        discussion: {
            model: 'discussion',
        },

        user: {
            model: 'user',
        },

        text: {
            type: 'string'
        },

        toREST: function() {
            return makeREST(this);
        },

    },

    //TODO: Seperate discussion messages from chat messages
    afterCreate: function(newMessage, cb) {
        message = makeREST(newMessage);
        if (newMessage.chat) {
            Chat.publishUpdate(newMessage.chat, {
                messages: [message]
            });
            Events.about("chats").emit("newMessage", newMessage);
        } else if (newMessage.discussion) {
            Discussion.publishUpdate(newMessage.discussion, {
                messages: [message]
            });
        }
        cb();
    }

};

IDGenerator.addIDtoModel(model, 22);