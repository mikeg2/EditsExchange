define([
    'angular',
    './module',
], function(angular) {

editEditorApp = angular.module('editEditorApp');

//TODO Figure out why this isn't saving updated text. Maybe editor is not updating UI
editEditorApp.factory('AutoSaver', function($timeout) {
    var deepCompare = function(arg1, arg2) {
        return angular.equals(arg1, arg2);
    };
    var DEFAULT_TIME_OUT = 1500;
    return {
        startAutoUpdater: function(options) {
            this.options = options;
            var edit = options.edit;
            var thisAutoSave = this;
            (function tick() {
                newState = options.stateCallback();
                var hasChanged = thisAutoSave.hasChanged(thisAutoSave.oldState, newState);
                if (hasChanged) {
                    thisAutoSave.hasChangedManual = false;
                    thisAutoSave.oldState = angular.copy(newState);
                    options.saving();
                    console.log("SAVING: " + JSON.stringify(newState));
                    options.saver(newState, options.saved, options.error);

                }
                $timeout(tick, options['timeout'] || DEFAULT_TIME_OUT);
            })();
        },
        hasChanged: function(oldState, newState) {
            if (oldState === undefined && newState !== undefined) {
                return true;
            } else if (this.options['autoDetectChange']) {
                console.log("OLD STATE: ", JSON.stringify(oldState));
                console.log("NEW STATE", JSON.stringify(newState));
                return !deepCompare(oldState, newState) || this.hasChangedManual;
            } else {
                return this.hasChangedManual;
            }
        },
        stateChanged: function() {
            this.hasChangedManual = true;
        },
        stopAutoUpdater: function() {
            $timeout.cancel(this.autoUpdater);
            this.autoUpdater = undefined;
        }
    };
});

});