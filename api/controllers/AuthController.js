/**
 * AuthController
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
var passport = require('passport');

module.exports = {

    /**
     * Action blueprints:
     *    `/auth/login`
     */
    login: function(req, res) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err || !user) {
                res.json({
                    errors: [{
                        msg: "Incorrect Username or Password"
                    }]
                }, 400);
            } else {
                req.logIn(user, function(err) {
                    res.json({}, 200);
                });
            }
        })(req, res);
    },


    /**
     * Action blueprints:
     *    `/auth/logout`
     */
    logout: function(req, res) {
        req.logout();
        res.send(200);
    },


    /**
     * Action blueprints:
     *    `/auth/register`
     */
    register: function(req, res) {
        req.assert("email", 'A valid email is required').isEmail();
        req.assert("password", 'A password is required').notEmpty();
        req.assert("username", 'A username is required').notEmpty();
        var errors = req.validationErrors();
        console.log("CALLED REGISTER");
        if (!errors) {
            UserService.signup({
                email: req.param('email'),
                password: req.param('password'),
                username: req.param('username')
            }).then(function(user) {
                console.log("SIGNUP SUCCESS");
                req.logIn(user, function() {
                    res.send({
                        successMessage: "A confirmation email has been sent to you account"
                    }, 200);
                });
            }, function(error) {
                console.log("ERROR OBJ: " + JSON.stringify(error));
                // TODO Move 'msg' to be part of the client, not the server
                if (error.number == 409 && error.field == 'email') {
                    res.send({
                        errors: [{
                            msg: "This email is already registered",
                            param: "email",
                            value: ""
                        }]
                    }, error.number);
                } else if (error.number == 409 && error.field == 'username') {
                    res.send({
                        errors: [{
                            msg: "This username is already in use",
                            param: "username",
                            value: ""
                        }]
                    }, error.number);
                } else {
                    res.send(error);
                }
            }).fail(function(err) {
                console.log("ERROR");
                res.send(500);
            });
        } else {
            console.log("ERRORS SENDING");
            res.send({
                errors: errors
            }, 400);
        }
    },


    /**
     * Action blueprints:
     *    `/auth/loggedIn`
     */
    loggedin: function(req, res) {
        res.send(req.isAuthenticated() ? req.user[0] : '0');
    },




    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to AuthController)
     */
    _config: {}


};