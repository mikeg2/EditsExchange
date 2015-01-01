exports.createEdit = function(draft, user, done) {
    Edit.create({
        content: draft.content,
        draft: draft,
        editor: user,
    }).exec(function(err, edit) {
        done(edit);
    });
};