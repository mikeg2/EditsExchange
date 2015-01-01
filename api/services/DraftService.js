var q = require('q');

exports.createDraft = function(params) {
    var deferred = q.defer();
    var promise = TagService.convertTitlesToIds(params['tagStrings']);
    promise.then(function(tags) {
        Draft.create({
            author: params['author'],
            content: params['content'],
            genres: params['genres'],
            groups: params['groups'],
            tags: tags,
            sample: params['sample'],
            title: params['title']
        }).then(function(draft) {
            deferred.resolve(draft);
        }, function() {
            deferred.reject(err);
        });
    }, function(err) {
        deferred.reject(err);
    }).fail(function(err) {
        deferred.reject(err);
    });
    return deferred.promise;
};