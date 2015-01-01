var bcrypt = require('bcrypt-nodejs');

var salt_length = 20;


exports.hash = function(pwd, fn) {
    bcrypt.hash(pwd, null, null, function(err, hash) {
        fn(hash);
    });
};

exports.compare = function(pwd, hash, fn) {
    bcrypt.compare(pwd, hash, function(err, res) {
        fn(err, res);
    });
};