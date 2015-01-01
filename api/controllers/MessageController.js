

module.exports = {
    createForChat: function(req, res) {
        Message.create({
            user: req.body.user,
            text: req.body.text,
            chat: req.param('chat_id')
        }).then(function() {
            res.send(200);
        });
    },
    createForDiscussion: function(req, res) {
        if (req.body.text.length === 0) {
            return res.send(400);
        }
        Message.create({
            user: req.body.user,
            text: req.body.text,
            discussion: req.param('discussion_id')
        }).then(function() {
            res.send(200);
        });
    }
};