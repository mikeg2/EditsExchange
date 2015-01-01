define([
'angular',
], function(angular) {

angular.module('smartPaste', []).directive('smartPaste', [function(){
    var generatedIds = 0;
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        require: '?ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, elem, attr, ngModel) {
            var updateView = function () {
                ngModel.$setViewValue(elem.val());
                if (!$scope.$root.$$phase) {
                    $scope.$apply();
                }
            };
            var id = "";
            if (!attr.id) {
                id = 'smart-paste-' + generatedIds++;
                attr.$set('id', id);
            } else {
                id = attr.id;
            }
            function saveInstantsToElement(inst) {
                var content = inst.getContent();
                elem.html(content);
            }
            $scope.$watch(function () {
                return ngModel.$modelValue;
            }, function(newValue) {
                console.log(newValue);
                tinymce.get(id).setContent(newValue);
            });
            // elem.bind('change', function(changeEvent){
            //     scope.$apply(function () {
            //         console.log("CHANGE!");
            //         content = changeEvent.target.html();
            //         tinymce.get(id).setContent(content);
            //     });
            // });
            options = {
                selector: '#' + id,
                width: "100%",
                menubar: false,
                statusbar: false,
                valid_styles: "color",
                invalid_styles: "font-size, font-family, background-color, vertical-align, white-space",
                theme_advanced_statusbar_location : "none",
                theme_advanced_toolbar_location : "none",
                setup: function (ed) {
                    // Update model on button click
                    ed.onExecCommand.add(function (e) {
                      ed.save();
                      updateView();
                    });
                    // Update model on keypress
                    ed.onKeyUp.add(function (e) {
                      ed.save();
                      updateView();
                    });
                    // Update model on change, i.e. copy/pasted text, plugins altering content
                    ed.onSetContent.add(function (e) {
                      if(!e.initial){
                        ed.save();
                        updateView();
                      }
                    });

                    ngModel.$render = function() {
                        ed.setContent(ngModel.$viewValue);
                    };
                }
            };
            console.log("OPTIONS: " + JSON.stringify(options));
            tinymce.init(options);
        }
    };
}]);

});