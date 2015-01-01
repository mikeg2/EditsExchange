/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */
var setupEmail = require('../bootstrap/email.js');

module.exports.bootstrap = function(cb) {
    try {
        setupEmail();
    } catch (exception) {
        console.log("ERROR SETTING UP EMAIL, ", exeption);
    }
    // It's very important to trigger this callack method when you are finished 
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};