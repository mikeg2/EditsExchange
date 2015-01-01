/**
 * Chat
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var IDGenerator = require('../services/IDGenerator');
var SocketModelService = require('../services/SocketModelService');
var RESTService = require('../services/RESTService');
var RESTUrlManager = require('../services/RESTUrlManager');
var q = require('q');
var _ = require('lodash');
var async = require('async');

var model = module.exports = {

    attributes: {
        id: {
            type: 'string',
            primaryKey: true
        },

        messages: {
            collection: 'message',
            via: 'chat',
            dominant: true
        },

        users: {
            collection: 'user',
            via: 'chats',
            dominant: true
        },

        hasUsers: function(toTest) {
            for (var i = 0; i < toTest.length; i++) {
                if (this.users.indexOf(toTest[i]) === -1) {
                    return false;
                }
            }
            return true;
        },

        toRESTasync: function() {
            var promiser = q.defer();
            var objREST = _.cloneDeep(this); // This prevents wierd sideffects with toObject that prevent toREST from working
            delete objREST.createdAt;
            delete objREST.updatedAt;
            Message.find({
                chat: objREST.id
            }).then(function(result) {
                return RESTService.RESTify(result);
            }).then(function(messages) {
                Object.defineProperty(objREST, 'messages', {
                    value: messages,
                    enumerable: true
                });
                promiser.resolve(objREST);
            });
            return promiser.promise;
        }

    },

    findChatWithUsers: function(usersIds) {
        promiser = q.defer();
        User.findOne(usersIds[0])
            .populate('chats').then(function(foundUser) {
                for (var i = 0; i < foundUser.chats.length; i++) {
                    var chat = foundUser.chats[i];
                    if (chat.hasUsers(usersIds)) {
                        return promiser.resolve(chat);
                    }
                }
                return promiser.resolve(undefined);
            });
        return promiser.promise;
    }

};

IDGenerator.addIDtoModel(model, 10);
// SocketModelService.addAllLifecycleCallbacks(model, "Chat");