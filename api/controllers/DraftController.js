/**
 * DraftsController
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

// TODO Add policy to protect from other users changing eachother's stuff
module.exports = {

    find: function(req, res) {
        ActionUtil.createQueryForRequest(Draft, req).where({
            id: req.param('draft_id')
        }).then(function(drafts) {
            var draft = drafts[0];
            return RESTService.RESTify(draft);
        }, function(err) {
            res.send(400);
        }).then(function(draft) {
            res.send(draft, 200);
        }).fail(function(err) {
            res.send(err, 500);
        });
    },

    findAllForUser: function(req, res) {
        ActionUtil.createQueryForRequest(Draft, req).where({
            author: req.param('user_id')
        }).then(function(drafts) {
            return ActionUtil.RESTifySend(req, res, drafts);
        });
    },

    findAllForGenre: function(req, res) {
        Genre.findOne(req.param("genre_id"))
            .populate('drafts', ActionUtil.criteriaFor(req))
            .then(function(genre) {
                return ActionUtil.RESTifySend(req, res, genre.drafts);
            });
    },

    findAllEditedByUser: function(req, res) {
        Edit.find({
            editor: req.param('user_id')
        }).populate('draft').then(function(edits) {
            var drafts = Util.getSubArray(edits, 'draft');
            return RESTService.RESTify(drafts);
        }).then(function(draftsRESTed) {
            res.send(draftsRESTed, 200);
        }, function(err) {
            res.send(500);
        });
    },

    //TODO Move "createDraft" logic into "beforeCreate" lifecycle callback
    create: function(req, res) {
        User.findOne({
            id: req.param('user_id')
        })
            .then(function(user) {
                console.log(JSON.stringify(req.body));
                return DraftService.createDraft({
                    author: user,
                    content: req.body.content,
                    title: req.body.title,
                    genres: req.body.genres,
                    tagStrings: req.body.tagStrings,
                    sample: req.body.sample,
                    groups: req.body.groups
                });
            }).then(function(draft) {
                return ActionUtil.RESTifySend(req, res, draft);
            }).fail(function(err) {

            });
    },

    update: function(req, res) {
        Draft.findOne(req.param('draft_id'))
            .then(function(draft) {
                if (draft == null) {
                    return res.send(404);
                }
                draft.text = req.body.text;
                draft.title = req.body.title;
                draft.save(function() {
                    res.send(200);
                });
            });
    },

    destroy: function(req, res) {
        Draft.findOne(req.param('draft_id')).exec(function(err, draft) {
            if (result == null) {
                return res.send(404);
            }
            draft.delete(function(err) {
                res.send(200);
            });
        });
    },


    findAllForGroup: function(req, res) {
        ActionUtil.createQueryForRequest(Draft, req, {
            groups: req.param('group_id')
        }).then(function(drafts) {
            return ActionUtil.RESTifySend(req, res, drafts);
        });
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to DraftsController)
     */
    _config: {

    }


};