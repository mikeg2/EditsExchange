module.exports = {

    createForDraft: function(req, res) {
        var invites = req.body;
        for (var i = 0; i < invites.length; i++) {
            var invite = invites[i];
            invite.draft = req.param('draft_id');
            console.log("INVITE: ", invite);
            Events.about("invites").emit("createForDraft", invite);
        }
        console.log("SENDING OK");
        res.send(200);
    },

    createForGroup: function(req, res) {
        var invites = req.body;
        for (var i = 0; i < invites.length; i++) {
            var invite = invites[i];
            invite.group = req.param('group_id');
            Events.about("invites").emit("createForGroup", invite);
        }
        res.send(200);
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to DraftsController)
     */
    _config: {

    }


};