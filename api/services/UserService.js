var q = require('q');

exports.signup = function(options) {
    var promiser = q.defer();
    var email = options.email;
    var username = options.username;
    var password = options.password;
    UserService.isEmailTaken(email).then(function(taken) {
        if (taken) {
            return promiser.reject({
                number: 409,
                field: 'email'
            });
        }
        UserService.isUsernameTaken(username).then(function(taken) {
            if (taken) {
                return promiser.reject({
                    number: 409,
                    field: 'username'
                });
            }
            EncryptionService.hash(password, function(hash) {
                User.create({
                    email: email,
                    username: username,
                    hash: hash
                }).exec(function(err, user) {
                    if (err) {
                        return promiser.reject(err);
                    }
                    promiser.resolve(user);
                });
            });
        });
    });
    return promiser.promise;
};

exports.isEmailTaken = function(email, userid) {
    var promiser = q.defer();
    if (!email) {
        promiser.resolve(false);
        return promiser.promise;
    }
    User.findOne({
        email: email
    }, function(err, user) {
        if (err) {
            promiser.reject(err);
        } else if (user == undefined || user.id == userid) {
            promiser.resolve(false);
        } else {
            promiser.resolve(true);
        }
    });
    return promiser.promise;
};

exports.isUsernameTaken = function(username, userid) {
    var promiser = q.defer();
    if (!username) {
        promiser.resolve(false);
        return promiser.promise;
    }
    User.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            promiser.reject(err);
        } else if (user == undefined || user.id == userid) {
            promiser.resolve(false);
        } else {
            promiser.resolve(true);
        }
    });
    return promiser.promise;
};

exports.isValidUserPassword = function(email, password) {
    promiser = q.defer();
    User.findOne({
        email: email
    }, function(err, user) {
        // if(err) throw err;
        if (err) return done(err);
        if (!user) return done(null, false, {
            message: 'Incorrect email.'
        });
        hash(password, user.salt, function(err, hash) {
            if (err) return done(err);
            if (hash == user.hash) return done(null, user);
            done(null, false, {
                message: 'Incorrect password'
            });
        });
    });
};