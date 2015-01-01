var q = require('q');
var _ = require('lodash');

module.exports = {

    find: function(req, res) {
        User.findOne(req.param('user_id')).then(function(user) {
            return RESTService.RESTify(user);
        }, function(err) {
            res.send(500);
        }).then(function(RESTifiedUser) {
            res.send(RESTifiedUser, 200);
        });
    },

    findAll: function(req, res) {
        ActionUtil.createQueryForRequest(User, req).then(function(users) {
            ActionUtil.RESTifySend(req, res, users);
        });

    },

    update: function(req, res) {
        q.spread([
            User.findOne(req.param('user_id')),
            UserService.isEmailTaken(req.body.email, req.param('user_id')),
            UserService.isUsernameTaken(req.body.username, req.param('user_id'))
        ], function(user, isEmailTaken, isUsernameTaken) {
            if (user === undefined) {
                return res.send(404);
            }
            if (isEmailTaken) {
                return res.send({
                    errors: [{
                        msg: "The requested email is already taken",
                        param: "email",
                        value: req.body.email
                    }]
                }, 409);
            } else if (isUsernameTaken) {
                return res.send({
                    errors: [{
                        msg: "The requested username is already taken",
                        param: "username",
                        value: req.body.username
                    }]
                }, 409);
            }
            var afterProfilePicture = function() {
                if (req.body.username) {
                    user.username = req.body.username;
                }
                if (req.body.email) {
                    user.email = req.body.email;
                }
                user.save(function() {
                    res.send(200);
                });
            };
            var uploader = StaticUploadService.getUploader(StaticUploadService.getDirectoryForUserProfilePicture());
            req.file('profilePicture').upload(uploader, function onUploadComplete(err, files) {
                if (err) {
                    res.send(err, 500);
                }
                if (files.length == 0) {
                    return afterProfilePicture();
                }
                user.profilePictureName = files[0].filename;
                afterProfilePicture();
            }, afterProfilePicture);
        }).fail(function(err) {
            res.send(err, 500);
        });
    },

    updateProfilePicture: function(req, res) {
        User.findOne(req.param('user_id')).then(function(user) {
            return user.setProfilePicture(req.files);
        }, function() {
            res.send(404);
        }).then(function() {
            res.send(200);
        }, function() {

        });
    },

    updatePassword: function(req, res) {
        var userRetrieved;
        User.findOne(req.param('user_id')).then(function(user) {
            userRetrieved = user;
            return user.isPassword(req.body.currentPassword);
        }, function(err) {
            res.send(404);
        }).then(function(isPassword) {
            if (!isPassword) {
                return res.send({
                    errors: [{
                        msg: "Wrong password",
                        param: "currentPassword"
                    }]
                }, 401);
            }
            return userRetrieved.setPassword(req.body.newPassword);
        }).then(function() {
            userRetrieved.save(function() {
                res.send(200);
            });
        });
    },

    // Subscriptions
    getAllSubscriptionsForUser: function(req, res) {
        User.findOne(req.param('user_id'))
            .populate('subscriptions', ActionUtil.criteriaFor(req))
            .then(function(user) {
                console.log("USER FOUND FOR GET ALL SUBSCRIPTIONS: ", user);
                return ActionUtil.RESTifySend(req, res, user.subscriptions);
            });
    },

    addSubscription: function(req, res) {
        User.findOne(req.param('user_id'))
            .then(function(user) {
                user.subscriptions = user.subscriptions || [];
                user.subscriptions.add(req.body.id);
                return user.save();
            })
            .then(function() {
                res.send(200);
            });
    },

    addSubscriber: function(req, res) {
        User.findOne(req.param('user_id'))
            .then(function(user) {
                user.subscribers.add(req.body.id);
                return user.save();
            })
            .then(function() {
                res.send(200);
            }, function() {
                res.send(200); //TODO: Don't do this
            });
    },

    removeSubscriber: function(req, res) {
        User.findOne(req.param('user_id'))
            .then(function(user) {
                user.subscribers.remove(req.param("subscriber_id"));
                return user.save();
            })
            .then(function() {
                res.send(200);
            });
    },

    findAllForGroup: function(req, res) {
        Group.findOne(req.param('group_id'))
            .populate('members', ActionUtil.criteriaFor(req))
            .then(function(group) {
                return ActionUtil.RESTifySend(req, res, group.members);
            });
    },


    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to TagController)
     */
    _config: {}


};