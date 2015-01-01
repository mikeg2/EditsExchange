define([
    'angular',
    './editDisplayers',
    'jquery'
], function(angular) {

editDisplayers = angular.module('editDisplayers');

//TODO Use .text instead of searching the iFrame for everything.
editDisplayers.factory('CommentLikeService', function($window, $timeout) {
    var makeid = function(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    };
    var getIframeIDForTinymce = function(tinymce) {
        return tinymce.id + "_ifr";
    };
    var alreadyHasComment = function(selection) {
        var content = "<span>" + selection.getContent() + "</span>";
        res2 = $(content).find('.range').length > 0 || $(selection.getNode()).attr("class") == "range";
        return res2;
    };
    omment = function(selection) {
        var content = "<span>" + selection.getContent() + "</span>";
        res2 = $(content).find('.range').length > 0 || $(selection.getNode()).attr("class") == "range";
        return res2;
    };
    var blankCallback = function() {};
    var createNullSafeCallback = function(unsafeCallback) {
        if (unsafeCallback == undefined) {
            return blankCallback;
        } else {
            return unsafeCallback;
        }
    };

    var object = {
        config: function(config) {
            config.onCommentAdded = createNullSafeCallback(config.onCommentAdded);
            config.onModelChange = createNullSafeCallback(config.onModelChange);
            config.onCommentDeleted = createNullSafeCallback(config.onCommentDeleted);
            this.config = config;
        },

        newRange: function(selection, id, classE) {
            console.log(selection);
            console.log("ID: " + id);
            if (alreadyHasComment(selection)) {
                $window.alert("Cannot comment the same text twice");
                return false;
            } else if (selection.getContent() == "") {
                $window.alert("Select text first, then hit comment.");
                return false;
            }
            var content = '<span class="' + this.config.rangeClass + " " + classE + '" data-id="' + id + '">' + selection.getContent({
                format: 'text'
            }) + '</span>';
            //$(selection).replaceWith(content);
            this.config.tinymceEditorCallback().execCommand('mceInsertContent', false, content);
            return true;
        },

        getCommentForID: function(id) {
            console.log("EDIT OBJ CALLBACK RESULT: " + JSON.stringify(this.config.editObjectCallback()));
            for (var i = 0; i < this.config.editObjectCallback().comments.length; i++) {
                var comment = this.config.editObjectCallback().comments[i];
                if (comment.id === id) {
                    return comment;
                }
            }
        },

        getCommentIndexForID: function(id) {
            var editObject = this.config.editObjectCallback();
            for (var i = 0; i < editObject.comments.length; i++) {
                var comment = editObject.comments[i];
                if (comment.id === id) {
                    return i;
                }
            }
        },

        newComment: function() {
            //Update text model
            var id = makeid(17);
            var ed = this.config.tinymceEditorCallback();
            var success = this.newRange(ed.selection, id, "comment");
            if (success) {
                commentObject = {
                    id: id
                };
                this.config.editObjectCallback().comments.push(commentObject);
                var self = this;
                $timeout(function() {
                    self.config.onCommentAdded(commentObject);
                    self.config.onModelChange();
                });
                return commentObject;
            }
        },
        newLike: function() {
            var id = makeid(15);
            var ed = config.tinymceEditorCallback();
            var success = newRange(ed.selection, id, "like");
            if (success) {
                likeObject = {
                    id: id
                };
                object.config.editObjectCallback().likes.push(likeObject);
                return likeObject;
            }
        },
        deleteComment: function(comment) {
            tinymceIframeID = getIframeIDForTinymce(this.config.tinymceEditorCallback());
            console.log("TINYMCE IFRAME ID: " + tinymceIframeID);
            $tinymcebody = $("#" + tinymceIframeID).contents().find('body');
            commentIndex = this.getCommentIndexForID(comment.id);
            this.config.editObjectCallback().comments.splice(commentIndex, 1);
            this.config.getRangeObjectForComment(comment).contents().unwrap();
            this.config.onCommentDeleted(comment);
            this.config.onModelChange();
        },
        deleteLike: function() {

        }
    };
    return object;
});

});