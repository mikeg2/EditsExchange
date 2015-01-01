EventEmitter = require('events').EventEmitter;

// Have to use global variable so there's the same variable used in config files
if (typeof(eventEmitters) === "undefined") {
    eventEmitters = {
        chats: new EventEmitter(),
        users: new EventEmitter(),
        drafts: new EventEmitter(),
        edits: new EventEmitter(),
        invites: new EventEmitter(),
        groups: new EventEmitter()
    };
}

exports.about = function(name) {
    return eventEmitters[name];
};