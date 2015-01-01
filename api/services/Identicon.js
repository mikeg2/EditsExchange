var identicon = require('identicon');
var q = require('q');

exports.create = function(string) {
    var defered = q.defer();
    EncryptionService.hash(string || this.username, function(hash) {
        identicon.generate(hash, 400, function(err, buffer) {
            if (err) {
                return defered.reject(err);
            } else {
                return defered.resolve(buffer);
            }
        });
    });
    return defered.promise;
};