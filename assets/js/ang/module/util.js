define([
'angular'
], function(angular) {

angular.module("util", []).factory("Util", function() {
    return {
        RESTequals: function(obj1, obj2) {
            return obj1 == obj2 || obj1.id == obj2.id || obj1 == obj2.id || obj1.id == obj2;
        },
        getMilliTimeDifferenceOfStrings: function(string1, string2, format) {
            return Date.parse(string1) - Date.parse(string2);
        },
        convertAllObjectsToIds: function(objects) {
            var converted = [];
            console.log("CONVERT TO IDS: ", objects);
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                if (obj.id) {
                    converted.push(obj.id);
                } else {
                    converted.push(obj);
                }
            }
            return converted;
        },
        eliminateDuplicates: function(arr) {
            var i,
                len = arr.length,
                out = [],
                obj = {};

            for (i = 0; i < len; i++) {
                obj[arr[i]] = 0;
            }
            for (i in obj) {
                out.push(i);
            }
            return out;
        }
    };
}).filter('subArray', function() {
    var emptyArray = [];
    return function(value, property) {
        if (!value) {
            return emptyArray;
        }
        var newArray = [];
        for (var i = 0; i < value.length; i++) {
            newArray[i] = value[i][property];
        }
        return newArray;
    };
}).filter('joinBy', function() {
    var emptyString = "";
    return function(input, delimiter) {
        if (input.length === 0) {
            return emptyString;
        }
        return input.join(delimiter || ', ');
    };
}).filter('cut', function() {
    return function(value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || '…');
    };
}).filter('toArray', function() {
    return function(value) {
        return [value];
    };
}).directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter, {
                        'event': event
                    });
                });

                event.preventDefault();
            }
        });
    };
}).directive('stopEvent', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            element.bind(attr.stopEvent, function(e) {
                e.stopPropagation();
                return false;
            });
        }
    };
}).directive('focusOn', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            focus: "=focusOn"
        },
        link: function(scope, element, attrs) {
            function checkValue(value) {
                console.log('value=', value);
                if (value === true) {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            }
            scope.$watch('focus', checkValue);
            checkValue();
            // to address @blesh's comment, set attribute value to 'false'
            // on blur event:
            element.bind('blur', function() {
                console.log('blur');
                scope.focus = false;
            });

            element.bind('focus', function() {
                scope.focus = true;
            });
        }
    };
});

});