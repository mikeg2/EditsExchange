module.exports = {

    //Auth
    auth: function(req, res) {
        if (req.isAuthenticated()) {
            return res.redirect('/');
        }
        return res.view({
            from: req.query.from
        });
    },

    logout: function(req, res) {
        req.logout();
        res.redirect('/auth');
    },

    //General
    userPage: function(req, res) {
        return res.view({
            userPageUserId: req.param('user_id')
        });
    },

    genres: function(req, res) {
        return res.view({
        });
    },

    exchange: function(req, res) {
        res.view({});
    },

    groups: function(req, res) {
        res.view({});
    },

    //User
    userDrafts: function(req, res) {
        res.view({});
    },

    userEdits: function(req, res) {
        res.view({});
    },


    userSettings: function(req, res) {
        res.view({});
    },

    userMessages: function(req, res) {
        res.view({});
    },

    userGroups: function(req, res) {
        res.view({
        });
    },

    groupPage: function(req, res) {
        res.view({
            groupId: req.param('group_id')
        });
    },

    genrePage: function(req, res) {
        res.view({
            genreId: req.param('genre_id')
        });
    },

    draftPage: function(req, res) {
        res.view({
            draftId: req.param('draft_id')
        });
    },

    //Edit Displayer
    editViewer: function(req, res) {
        res.view({
            editID: req.param('edit_id')
        });
    },

    editEditor: function(req, res) {
        res.view({
            draftID: req.param('draft_id'),
            draftEditorID: req.param('user_id')
        });
    },

    _config: {}


};