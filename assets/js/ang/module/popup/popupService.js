define([
    'angular',
    ''
], function(angular) {

angular.module('popup', []).factory('PopupService', function() {
    var activePopups = [];

    Array.prototype.remove = function() {
        var what, a = arguments,
            L = a.length,
            ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    var getPopupForObjID = function(obj_id) {
        for (var i = 0; i < activePopups.length; i++) {
            if (activePopups[i].id == obj_id) {
                return activePopups[i];
            }
        }
        return null;
    };

    var autoHide = function() {
        activePopups.forEach(function(entry) {
            if (entry.autoHide === true) {
                entry.hide();
            }
        });
    };


    var repositionObjectAt = function($obj, xCord, yCord) {
        $obj.css('position', 'fixed');
        $obj.css('top', yCord + "px");
        $obj.css('left', xCord + "px");
    };

    var getTopLeftWhenTopAt = function($obj, xCord, yCord) {
        return {
            left: xCord - $obj.outerWidth() / 2,
            top: yCord + Number($obj.css('margin-top').slice(0, -2))
        };
    };

    var getTopLeftWhenBottomAt = function($obj, xCord, yCord) {
        margin_bottom = -Number($obj.css('margin-bottom').slice(0, -2));
        margin_bottom = margin_bottom === null ? 0 : margin_bottom;
        console.log(margin_bottom);
        return {
            left: xCord - $obj.outerWidth() / 2,
            top: yCord - $obj.height() + margin_bottom
        };
    };

    var getTopLeftWithOrigin = function($obj, xCord, yCord, origin) {
        if (origin == 'top') {
            return getTopLeftWhenTopAt($obj, xCord, yCord);
        } else {
            return getTopLeftWhenBottomAt($obj, xCord, yCord);
        }
    };

    var setUpPopupObject = function(obj, options) {
        $obj = $(obj);
        $obj.addClass('popup');
        $obj.on('click', function() {
            return false;
        });
    };

    var registerPopupObject = function(obj, options) {
        var popup = {
            $obj: $(obj),
            id: this.$obj.attr('id'),
            removePopup: function() {
                this.$obj.hide();
                activePopups.remove(this);
                this.onRemove();
            },
            isVisible: function() {
                return this.$obj.is(":visible");
            },
            hide: function(dontCallCallback) {
                this.$obj.hide();
                console.log("CALLING ON HIDE");
                this.onHide();
            },
            show: function(x, y, origin) {
                if (options['hideOthers'] || options['hideOthers'] == undefined) {
                    service.hideAllPopups(this);
                }
                this.reposition(x, y, origin);
                this.$obj.show();
            },
            reposition: function(x, y, origin) {
                if (this.flipOriginIfNecessary) {
                    origin = flipOriginIfNecessary(this.$obj, x, y, origin);
                }
                toPoint = getTopLeftWithOrigin(this.$obj, x, y, origin);
                toPoint = pushOnScreen(this.$obj, toPoint);
                console.log("TO POINT: " + JSON.stringify(toPoint));
                repositionObjectAt(this.$obj, toPoint.left, toPoint.top);
            },
            onRemove: options['onRemove'] || function() {},
            onHide: options['onHide'] || function() {},
            flipOriginIfNecessary: options['flipOriginIfNecessary'] || true,
            autoHide: options['autoHide'] === undefined ? true : options['autoHide']
        };
        activePopups.push(popup);
        return popup;
    };

    var flipOriginIfNecessary = function($obj, x, y, origin) {
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();
        var objHeight = $obj.height() + getMarginInDirection($obj, origin);
        console.log("REGARDLESS Y: " + y + " OBJ HEIGHT: " + objHeight + " WINDOW HEIGHT: " + windowHeight);
        if (origin == "top" && (windowHeight - y < objHeight)) {
            console.log("Y: " + y + " OBJ HEIGHT: " + objHeight + " WINDOW HEIGHT: " + windowHeight);
            return "bottom";
        } else if (origin == "bottom" && (y < objHeight)) {
            console.log("Y: " + y + " OBJ HEIGHT: " + objHeight);
            return "top";
        }
        return origin;
    };

    var getMarginInDirection = function($obj, origin) {
        return Number($obj.css('margin-' + origin).slice(0, -2));
    };

    //TODO Add more sophisticated, flip if necessary, then adjust both x and y
    var pushOnScreen = function($obj, topLeftCorner) {
        console.log("TOP LEFT: " + JSON.stringify(topLeftCorner));
        margin_left = getMarginInDirection($obj, "left");
        margin_top = getMarginInDirection($obj, "top");
        left = topLeftCorner.left < margin_left ? margin_left : topLeftCorner.left;
        top2 = topLeftCorner.top < margin_top ? margin_top : topLeftCorner.top;
        right = Number((left + $obj.outerWidth() + Number($obj.css('margin-right').slice(0, -2))));
        if (right > $(window).width()) {
            left = left - (right - $(window).width());
        }
        return {
            top: top2,
            left: left
        };
    };

    var service = {
        manualAutoHide: function() {
            console.log("MANUAL");
            autoHide();
        },
        activateAutoHide: function($scope) {
            $(document).ready(function() {
                var autoHideWithApply = function() {
                    autoHide();
                    $scope.$apply();
                };
                $('body').bind('click', autoHideWithApply);
                $(window).resize(autoHideWithApply);
                $(window).scroll(autoHideWithApply);
            });
        },

        popPopup: function(obj, options) {
            $obj = $(obj);
            setUpPopupObject($obj, options);
            popup = registerPopupObject($obj, options);
            console.log("POP OPTIONS: " + JSON.stringify(options));
            if (options['x']) {
                popup.reposition(options['x'], options['y'], options['origin']);
            }
            return popup;
        },

        togglePopup: function(obj, options) {
            popup = getPopupForObjID(obj.attr('id'));
            if (popup === null) {
                return this.popPopup(obj, options);
            } else if (popup.isVisible()) {
                popup.hide();
            } else {
                popup.show();
            }
        },

        hideAllPopups: function(except) {
            activePopups.forEach(function(entry) {
                if (entry == except) {
                    return;
                }
                entry.hide();
            });
        },

    };
    return service;
});

});