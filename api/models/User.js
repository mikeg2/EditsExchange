/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var IDGenerator = require('../services/IDGenerator');
var SocketModelService = require('../services/SocketModelService');
var RESTUrlManager = require('../services/RESTUrlManager');
var fs = require('fs');
var q = require('q');

var model = module.exports = {
    autoPK: false,
    attributes: {

        id: {
            type: 'string',
            primaryKey: true
        },

        username: {
            type: 'string',
            unique: true
        },

        //TODO Replace this with Document model foreign key
        profilePictureName: {
            type: 'string',
        },

        email: {
            type: 'string',
            required: true,
            unique: true,
            email: true
        },

        hash: {
            type: 'string',
            required: true
        },

        drafts: {
            collection: 'draft',
            via: 'author'
        },

        edits: {
            collection: 'edit',
            via: 'editor'
        },

        chats: {
            collection: 'chat',
            via: 'users'
        },

        lastLogin: {
            type: 'datetime'
        },

        // Subscriptions
        subscribers: {
            collection: 'user',
            via: 'subscriptions',
            dominant: true
        },

        subscriptions: {
            collection: 'user',
            via: "subscribers"
        },

        // Other
        
        groups: {
            collection: 'group',
            via: 'members'
        },

        toREST: function() {
            var objREST = this.toObject();
            objREST.profilePicture = {
                url: StaticUploadService.getUrlForUserProfilePicture(objREST.profilePictureName)
            };
            objREST.joinedDate = objREST.createdAt;
            delete objREST.hash;
            delete objREST.createdAt;
            delete objREST.updatedAt;
            delete objREST.profilePictureName;
            return objREST;
        },

        setPassword: function(password) {
            var promiser = q.defer();
            var self = this;
            EncryptionService.hash(password, function(hash) {
                self.hash = hash;
                promiser.resolve();
            });
            return promiser.promise;
        },

        isPassword: function(password) {
            var promiser = q.defer();
            EncryptionService.compare(password, this.hash, function(err, isUserPassword) {
                if (err) {
                    return promiser.reject(err);
                }
                if (isUserPassword) {
                    return promiser.resolve(true);
                } else {
                    promiser.resolve(false);
                }
            });
            return promiser.promise;
        },

        setProfilePicture: function(file) {
            var promiser = q.defer();
            var imageName = StaticUploadService.createNewFileName();
            var self = this;
            StaticUploadService.saveNewFileAs({
                file: file,
                destination: StaticUploadService.getDirectoryForUserProfilePicture(imageName)
            }).then(function success() {
                self.profilePictureName = imageName;
                promiser.resolve(self);
            }, function error(err) {
                promiser.reject(err);
            });
            return promiser.promise;

        }

    },

    beforeCreate: function(values, next) {
        var imageIsNotSet = values.profilePictureName === undefined;
        values.lastLogin = new Date();
        if (imageIsNotSet) {
            Identicon.create(values.username).then(function(buffer) {
                var imageName = StaticUploadService.createNewFileName('.png');
                var urlForImage = StaticUploadService.getDirectoryForUserProfilePicture(imageName);
                fs.writeFileSync(urlForImage, buffer);
                values.profilePictureName = imageName;
                next();
            });
        } else {
            next();
        }
    }

};

IDGenerator.addIDtoModel(model, 6);