var passport = require('passport');
var expressValidator = require('express-validator');
var lessMiddleware = require('less-middleware');
var express = require('express');

module.exports = {
    express: {
        customMiddleware: function(app) {
            console.log('express midleware');
            app.use(passport.initialize());
            app.use(passport.session());
            app.use(expressValidator());
            app.use(lessMiddleware(__dirname + '/assets'));
            app.use('/api/v0/static', express.static('static/'));
        }
    }
};