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

module.exports = {

    find: function(req, res) {
        ActionUtil.createQueryForRequest(Discussion, req, {
            id: req.param('discussion_id')
        }).then(function(discussions) {
            ActionUtil.addSubscription(req, Discussion, discussions[0]);
            ActionUtil.RESTifySend(req, res, discussions[0]);
        });
    },

    create: function(req, res) {
        Discussion.create({
            group: req.body.group,
            topic: req.body.topic
        })
        .then(function(discussion) {
            return [discussion, Message.create({
                user: req.body.firstPost.user,
                text: req.body.firstPost.text,
                discussion: discussion.id
            })];
        })
        .spread(function(discussion) {
            ActionUtil.RESTifySend(req, res, discussion);
        }).fail(function(err) {
            res.send(err);
        });

    },

    findAllForGroup: function(req, res) {
        ActionUtil.createQueryForRequest(Discussion, req, {
            group: req.param('group_id')
        }).then(function(discussions) {
            ActionUtil.addSubscription(req, Discussion, discussions);
            ActionUtil.RESTifySend(req, res, discussions);
        });
    },

    




    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ChatController)
     */
    _config: {}


};