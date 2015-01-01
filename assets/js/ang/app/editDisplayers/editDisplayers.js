define(['angular', 'angular-cookie', 'ip-cookie', 'ang/module/chat/chat', 'ang/module/util'], function(angular) {
    return angular.module('editDisplayers', ['ipCookie', 'modal', 'chat', 'util']);
});