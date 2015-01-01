/**
 * Binds a TinyMCE widget to <textarea> elements.
 */

define([
    'angular',
    './editDisplayers',
    'jquery',
    'ice_tinymce/ice',
    'pxem.JQuery',
    'ice_tinymce/tinymce/jscripts/tiny_mce/tiny_mce',
    'jquery.browser.min',
    'jquery-migrate',
], function(angular) {
//TODO Heavily refactor to decouple and make reusabl
angular.module('editDisplayers').directive('editor', ['DOMManipulator', 'CommentLikeService', '$timeout',

        function(DOMManipulator, CommentLikeService, $timeout) {
            var generatedIds = 0;
            return {
                require: 'ngModel',
                scope: {
                    "fontSize": "=",
                    "fontFamily": "=",
                    "colorMode": "=",
                    "activeComment": "=",
                    "newComment": "&"
                },
                link: function(scope, elm, attrs, ngModel) {
                    var getIFrame = function() {
                        if (getIFrame.catchedValue === undefined) {
                            iFrameId = "#" + attrs.id + "_ifr";
                            console.log("IFRAME ID: " + iFrameId);
                            console.log("SIBLINGS: " + $(elm).siblings().length);
                            getIFrame.catchedValue = $(elm).siblings().find(iFrameId);
                        }
                        console.log("#IFrame: " + getIFrame.catchedValue.length);
                        return getIFrame.catchedValue;
                    };
                    var getIframeBody = function() {
                        return getIFrame().contents().find('body');
                    };

                    var expression, options, tinyInstance,
                        updateView = function() {
                            ngModel.$setViewValue(elm.val());
                            if (!scope.$root.$$phase) {
                                scope.$apply();
                            }
                        };
                    // generate an ID if not present
                    if (!attrs.id) {
                        attrs.$set('id', 'uiTinymce' + generatedIds++);
                    }

                    if (attrs.uiTinymce) {
                        expression = scope.$eval(attrs.setup);
                    } else {
                        expression = {};
                    }
                    var makeCommentsClickable;
                    var initTinymceModifications = function() {
                        ngModel.$render = function() {
                            if (!tinyInstance) {
                                tinyInstance = tinymce.get(attrs.id);
                            }
                            if (tinyInstance) {
                                tinyInstance.setContent(ngModel.$viewValue || '');
                            }
                        };
                        // Tinymce Events
                        getIFrame().contents().scroll(function() {
                            scope.$emit('editorScrolled');
                            scope.$apply();
                        });
                        getIframeBody().on('click', function() {
                            scope.$emit('editorClicked');
                            scope.$apply();
                        });

                        // Display Controls
                        var setFontSize = function(size) {
                            getIframeBody().css('font-size', size + 'px');
                        };
                        var getFontSize = function() {
                            return Number(getIframeBody().css('font-size').slice(0, -2));
                        };
                        scope.$watch('fontSize', setFontSize);
                        if (scope.fontSize == undefined) {
                            scope.fontSize = getFontSize();
                        } else {
                            setFontSize(scope.fontSize);
                        }

                        var getFontFamily = function() {
                            if (tinymce.activeEditor == null) {
                                return null;
                            }
                            return getIframeBody().css('font-family');
                        };
                        var setFontFamily = function(font_family) {
                            getIframeBody().css('font-family', font_family);
                        };
                        scope.$watch('fontFamily', setFontFamily);
                        if (scope.fontFamily == undefined) {
                            scope.fontFamily = getFontFamily();
                        } else {
                            setFontFamily(scope.fontFamily);
                        }

                        var setColorMode = function(newMode, oldMode) {
                            var colorModePrefix = "color-mode-";
                            var body = getIframeBody();
                            body.removeClass(colorModePrefix + oldMode);
                            body.addClass(colorModePrefix + newMode);
                            console.log("SET TO: " + newMode);
                        };
                        scope.$watch('colorMode', setColorMode);

                        scope.colorMode = scope.colorMode || 'W';
                        setColorMode(scope.colorMode, "");

                        var getRangeForComment = function(comment) {
                            return getIframeBody().find('.range[data-id="' + comment.id + '"]');
                        };
                        scope.$watch('activeComment', function(comment) {
                            if (comment === undefined) {
                                return;
                            }
                            range = getRangeForComment(comment);
                            if (range.length === 0) {
                                return;
                            }
                            scope.$emit('editorAutoScrollStarted');
                            var endEvent = "editorAutoScrolled";
                            DOMManipulator.centerInIframe({
                                toCenter: range,
                                offset: (getIFrame().height() / 2) * (1 / 3), // The (...)/2 centers it, the * 1/3 makes it a third from the top
                                speed: 2,
                                onFinish: function(didScroll) {
                                    if (!didScroll) {
                                        $timeout(function() { // Gives other parts of program time to register for event 
                                            console.log("EMITTED");
                                            scope.$emit(endEvent);
                                        }, 5);
                                    } else {
                                        $timeout(function() {
                                            console.log("EMITTED");
                                            scope.$emit(endEvent);
                                        });
                                    }
                                    scope.$apply();
                                }
                            });
                        });

                        var setActiveCommentByID = function(id) {
                            console.log("ID: " + id);
                            scope.activeComment = CommentLikeService.getCommentForID(id);
                            console.log("GOT ACTIVE COMMENT");
                            console.log("RETURNED COMMENT: " + JSON.stringify(CommentLikeService.getCommentForID(id)));
                            console.log("ACTIVE COMMENT: " + JSON.stringify(scope.activeComment));
                        };
                        makeCommentsClickable = function() {
                            console.log("COMMENT ADDED");
                            getIframeBody().find('.range.comment').on('click', function() {
                                console.log("CLICKED RANGE");
                                setActiveCommentByID($(this).attr('data-id'));
                                scope.$apply();
                            });
                        };
                        scope.$on('commentAdded', makeCommentsClickable);
                        makeCommentsClickable();
                    };

                    var edGlobal;
                    options = {
                        statusbar: false,
                        valid_styles: "color",
                        invalid_styles: "font-size",
                        plugins: "ice, paste",
                        theme_advanced_buttons1: "bold,italic,|,link,image,|,align-left,aligncenter,alignright,|,cut,copy,past,|,bullist,numlist,outdent,indent,blockquote,|,icereject", //|,iceacceptall,icerejectall,iceaccept,",
                        ice: {
                            user: {
                                name: "",
                                id: ""
                            },
                            preserveOnPaste: 'p,a[href],i,em,strong',
                            deleteTag: 'delete',
                            insertTag: 'insert'
                        },
                        selector: "textarea",
                        menubar: false,
                        width: "100%",
                        font_formates: "",
                        content_css: "/styles/displayer-content.css",
                        paste_text_sticky: true,
                        // Update model when calling setContent (such as from the source editor popup)
                        setup: function(ed) {
                            edGlobal = ed;
                            if (scope.onLoad) {
                                ed.onLoadContent.add(scope.onLoad());
                            }
                            if (attrs.readOnly) {
                                ed.onInit.add(function() {
                                    ed.getBody().setAttribute('contenteditable', false);
                                });
                            }
                            var args;
                            ed.onInit.add(function(args) {
                                initTinymceModifications();
                                ed.pasteAsPlainText = true;
                            });
                            // Update model on button click
                            ed.onExecCommand.add(function(e) {
                                scope.$emit('editorDOMChanged');
                                onEditorDOMChanged(ed);
                            });
                            // Update model on keypress
                            ed.onKeyUp.add(function(e) {
                                scope.$emit('editorDOMChanged');
                                onEditorDOMChanged(ed);
                            });
                            // Update model on change, i.e. copy/pasted text, plugins altering content
                            ed.onSetContent.add(function(e) {
                                if (!e.initial) {
                                    scope.$emit('editorDOMChanged');
                                    onEditorDOMChanged(ed);
                                }
                            });

                            if (expression.setup) {
                                scope.$eval(expression.setup);
                                delete expression.setup;
                            }
                        },
                        mode: 'exact',
                        elements: attrs.id
                    };
                    if (attrs.readOnly) {
                        options.theme_advanced_buttons1 = "";
                    }
                    var onEditorDOMChanged = function() {
                        edGlobal.save();
                        updateView();
                        if (makeCommentsClickable !== undefined) {
                            makeCommentsClickable();
                        }
                    };
                    scope.$on('editorDOMChanged', onEditorDOMChanged);
                    setTimeout(function() {
                        tinymce.init(options);
                    });
                },
                //TODO Find a way to decople the CommentLikeService from referencing this editor specifically
            };
        }
    ]);

});