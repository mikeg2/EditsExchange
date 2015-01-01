/**
 * GroupController
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
    
    //TODO: Make it so that it only finds those with public visibility
  findAll: function(req, res) {
    var where = ActionUtil.parseWhere(req) || {};
    where.type = {'not': 'secret'};
    ActionUtil.createQueryForRequest(Group, req, where).then(function(groups) {
        console.log('GROUPS: ', groups);
        return ActionUtil.RESTifySend(req, res, groups);
    });
  },

  find: function(req, res) {
    ActionUtil.createQueryForRequest(Group, req, {
        id: req.param('group_id'),
    }).then(function(groups) {
        return ActionUtil.RESTifySend(req, res, groups[0]);
    });
  },

  findRandom: function(req, res) {
    Group.findRandom(ActionUtil.parseLimit(req), {})
      .then(function(groups) {
        console.log("FOUND RANDOM: ", groups);
        return ActionUtil.RESTifySend(req, res, groups);
      })
      .fail(function(err) {
        console.log("findRandom Error: ", err);
        res.send(500);
      });
  },

  //TODO: Make admin a member of group
  create: function(req, res) {
    var input = req.body;
    Group.create({
        name: input.name,
        type: input.type,
        description: input.description,
        tagStrings: input.tagStrings,
        admin: input.admin,
        members: [input.admin]
    }).then(function(group) {
        return ActionUtil.RESTifySend(req, res, group);
    }).fail(function(err) {
        console.log("ERROR: ", err);
    });
  },

  findAllForUser: function(req, res) {
    User.findOne(req.param("user_id"))
      .populate("groups", ActionUtil.criteriaFor(req))
      .then(function(user) {
        console.log("FETCHED: ", user);
        ActionUtil.RESTifySend(req, res, user.groups);
      });
  },

  update: function(req, res) {
    console.log("UPDATE GROUP");
    Group.findOne(req.param("group_id"))
      .then(function(group) {
        var uploader = StaticUploadService.getUploader(StaticUploadService.getDirectoryForGroupPicture());
        req.file('groupPicture').upload(uploader, function onUploadComplete(err, files) {
            console.log("RECIEVED GROUP PICTURE: ", files, " ERRORS: ", err);
            if (err) {
                return res.send(err, 500);
            }
            if (files.length === 0) {
                return afterPhotoUpload();
            }
            group.groupPictureName = files[0].filename;
            console.log("GROUP PICTURE NAME: ", group.groupPictureName);
            afterPhotoUpload();
        }, afterPhotoUpload);

        function afterPhotoUpload() {
          var input = req.body;
          group.name = input.name;
          group.description = input.description;
          group.type = input.type;
          group.tagStrings = input.tagStrings;
          group.save().then(function() {
              return res.send(200);
          });
        }
      });
  },

  addMember: function(req, res) {
    console.log("ADDING MEMBER: ", req.body);
    Group.findOne(req.param('group_id'))
        .then(function(group) {
            console.log("ADDING: ", req.body.id, "To", group);
            group.members.add(req.body.id);
            return group.save();
        }).then(function() {
            res.send(200);
        }).fail(function(err) {
          console.log("addMember ERROR: ", err);
            res.send(500);
        });
  },

  removeMember: function(req, res) {
    Group.findOne(req.param('group_id'))
        .then(function(group) {
            console.log("REMOVING: ", req.param('user_id'));
            group.members.remove(req.param('user_id'));
            return group.save();
        }).then(function() {
            res.send(200);
        });
  },

  // activity
  findGroupActivity: function(req, res) {
    console.log("FIND GROUP ACTIVITY");
    Group.findOne(req.param('group_id'))
      .then(function(group) {
        console.log("CALL COLLECT");
        return group.collectActivity();
      }).then(function(activity) {
        res.send(activity);
      });
  },

  changeAdmin: function(req, res) {
    Group.findOne(req.param('group_id'))
      .populate('admin')
      .then(function(group) {
        console.log("IS PASSWORD? ", group.admin.isPassword);
        return [group, group.admin.isPassword(req.body.adminPassword)];
      })
      .spread(function(group, isPassword) {
        console.log("IS PASSWORD: ", isPassword);
        if (!isPassword) {
          res.send({
            errors: [{
              msg: "Admin passsword is incorrect",
              param: "adminPassword",
              value: req.body.adminPassword
            }]
          }, 400);
        } else {
          User.findOne(req.body.newAdmin)
            .then(function(newAdmin) {
              if (!newAdmin) {
                return res.send(400);
              }
              group.admin = newAdmin.id;
              group.members.add(newAdmin.id); // TODO: Make sure this doesn't create duplicates
              return group.save();
            })
            .then(function() {
              res.send(200);
            }).fail(function(err) {
              console.log("CHANGE ADMIN ERR: ", err);
              res.send(500);
            });
          }
      });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GroupController)
   */
  _config: {}

  
};
