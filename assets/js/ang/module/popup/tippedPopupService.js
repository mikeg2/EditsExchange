define([
    'angular',
    'tipped'
], function(angular) {

angular.module('popup', []).factory('PopupService', function() {
    return {
        hideAll: Tipped.hideAll,
        
    };
});

});