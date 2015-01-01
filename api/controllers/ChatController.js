/**
 * ChatController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

function sendChats(req, res, chats) {
    ActionUtil.RESTifySend(req, res, chats);
}

function isCreateRequestValid(req) {
    return !areDuplicates(req.body.users);
}

function eliminateDuplicates(arr) {
    var i,
        len = arr.length,
        out = [],
        obj = {};

    for (i = 0; i < len; i++) {
        obj[arr[i]] = 0;
    }
    for (i in obj) {
        out.push(i);
    }
    return out;
}

module.exports = {

    find: function(req, res) {
        ActionUtil.createQueryForRequest(Chat, req, {
            id: req.param('chat_id')
        }).then(function(chats) {
            ActionUtil.addSubscription(req, Chat, chats[0]);
            sendChats(req, res, chats[0]);
        });
    },

    findAllForUser: function(req, res) {
        User.findOne(req.param('user_id'))
            .populate('chats', ActionUtil.criteriaFor(req))
            .then(function(user) {
                sendChats(req, res, user.chats);
            });
    },

    getOrCreateChat: function(req, res) {
        var noDuplicateUsers = eliminateDuplicates(req.body.users);
        if (noDuplicateUsers.length < 2) {
            return res.send(400);
        }
        Chat.findChatWithUsers(noDuplicateUsers)
            .then(function(chat) {
                if (chat) {
                    ActionUtil.addSubscription(req, Chat, chat);
                    sendChats(req, res, chat);
                } else {
                    Chat.create({
                        users: req.body.users,
                    }).then(function(chat) {
                        ActionUtil.addSubscription(req, Chat, chat);
                        sendChats(req, res, chat);
                    });
                }
            });
    },


    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ChatController)
     */
    _config: {}


};