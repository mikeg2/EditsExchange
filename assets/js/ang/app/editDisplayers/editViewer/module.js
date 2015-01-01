define([
    'angular',
    '../editDisplayers',
    'jquery',
    'sails.io',
    'sockets.io',
    '/modules/popup',
    'ngCookies',
], function(angular) {

    return angular.module('editViewerApp', ['sails.io', 'sockets', 'popup', 'ngCookies', 'editDisplayers']);

});