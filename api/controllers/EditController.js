/**
 * EditsController
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

var async = require('async');

// function addDeepSubscription(req, Model, objs) {
//     for (var i = 0; i < objs.length; i++) {
//         addDeepSubscription(req, Model, objs[i]);
//     }
// }

var onEditToSendRetrieved = function(req, res, edit) {
    ActionUtil.addSubscription(req, Edit, edit);
    ActionUtil.RESTifySend(req, res, edit);
};

module.exports = {

    findOrCreateByUser: function(req, res) {
        Draft.findOne().where({
            id: req.param('draft_id')
        })
            .then(function(draft) {
                if (draft == undefined) {
                    return res.send(404);
                }
                return [User.findOne().where({
                    id: req.param('user_id')
                }), draft];
            }).spread(function(user, draft) {
                if (user == undefined) {
                    return res.send(404);
                }
                return [Edit.findOne().where({
                    editor: user.id,
                    draft: draft.id
                }), user, draft];
            }).spread(function(edit, user, draft) { //TODO Figure out why this has "edit" always = undefined
                if (edit == undefined) {
                    EditService.createEdit(draft, user, function(edit) {
                        onEditToSendRetrieved(req, res, edit);
                    });
                } else {
                    onEditToSendRetrieved(req, res, edit);
                }
            });
    },

    findAllForDraft: function(req, res) {
        ActionUtil.createQueryForRequest(Edit, req, {
            draft: req.param('draft_id')
        }).then(function(edits) {
            onEditToSendRetrieved(req, res, edits);
        }).fail(function(err) {
            console.log(err);
            res.send(500);
        });
    },

    findAllEditComments: function(req, res) {
        Comment.find({
            edit: req.param('edit_id')
        }).then(function(comments) {
            console.log(JSON.stringify(comments));
            return RESTService.RESTify(comments);
        }, function(err) {
            console.log(err);
        }).then(function(RESTifiedComments) {
            res.send(RESTifiedComments, 200);
        });
    },

    replaceEditComments: function(req, res) {
        var editId = req.param('edit_id');
        Comment.destroy({
            edit: editId
        }).then(function() {
            var comments = req.body;
            async.each(comments, function(comment, doneOrError) {
                Comment.create({
                    text: comment.text,
                    id: comment.id,
                    edit: editId
                }).exec(function(err) {
                    if (err) {
                        return doneOrError(500);
                    }
                    doneOrError();
                });
            }, function(err) {
                if (err) {
                    res.send(err);
                } else {
                    Edit.publishUpdate(editId, {});
                    res.send(200);
                }
            });
        }, function(err) {
            res.send(err, 500);
        });
    },

    deleteByUser: function(req, res) {

    },

    updateByUser: function(req, res) {

    },

    destroy: function(req, res) {

    },

    update: function(req, res) {
        Edit.findOne(req.param('edit_id')).then(function(edit) {
            edit.comments = req.body.comments;
            edit.content = req.body.content;
            edit.overallComments = req.body.overallComments;
            edit.save(function() {
                res.send(200);
            });
        });
    },

    find: function(req, res) {
        ActionUtil.createQueryForRequest(Edit, req, {
            id: req.param('edit_id')
        }).then(function(edits) {
            var edit = edits[0];
            if (edit === undefined) {
                res.send(404);
            }
            onEditToSendRetrieved(req, res, edit);
        });
    },



    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to EditsController)
     */
    _config: {}


};