define([
    'angular',
    '../editDisplayers',
    'jquery',
    'sails.io',
    'socket.io',
    'ang/module/popup/popup',
    'ip-cookie',
    'ang/module/URLManager',
    'ang/api/api',
    'ip-cookie'
], function(angular) {

    return angular.module('editEditorApp', ['URLManager', 'API', 'popup', 'ngCookies','ipCookie', 'editDisplayers']);

});