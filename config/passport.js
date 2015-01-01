var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

function forAllLogin(user, cb) {
    user.lastLogin = new Date();
    user.save(cb);
}

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(user_id, done) {
    User.find({
        id: user_id
    }).exec(function(err, user) {
        done(err, user);
    });
});

passport.use('local-login', new LocalStrategy({
    usernameField: "email",
    passwordField: "password"

}, function(username, password, done) {
    console.log("USERNAME: " + username);
    process.nextTick(function() {
        User.find({
            email: username
        }, function(err, users) {
            var user = users[0];
            if (err) {
                return done(null, err);
            }
            if (!user) {
                return done(null, false, {
                    message: "Incorrect Username"
                });
            }
            forAllLogin(user, function() {
                user.isPassword(password).then(function(isPassword) {
                    if (isPassword) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: "Incorrect Password"
                        });
                    }
                }, function(err) {
                    done(err);
                });
            });
        });
    });
}));

// passport.use(new FacebookStrategy({
//     clientID: FACEBOOK_APP_ID,
//     clientSecret: FACEBOOK_APP_SECReT,
//     callbackURL: "",
//     enableProof: false
// }), function(accessToken, refreshToken, profile, done) {
//     User.findOrCreate({
//         facebookId: profile.id
//     }, function(err, user) {
//         return done(err, user);
//     });
// });