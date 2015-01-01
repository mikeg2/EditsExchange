define([
    'angular',
    'lib/jszip.min',
    'lib/docx'
], function(angular) {

angular.module('uploadToText', []).directive('uploadToText', [function(){
    var generatedIds = 0;
    function convertNodeListToString(nodelist) {
        var final_html = Array.prototype.reduce.call(nodelist, function(html, node) {
            return html + ( node.outerHTML || node.nodeValue );
        }, "");
        return final_html;
    }
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {
            'uploadToText': '=to',
            'uploaded': '&'
        }, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        template: '<input type="file" ng-file-select="onFileSelect($files)">',
        // templateUrl: '',
        replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, elem, attr, controller) {
            var uploaded = attr.uploaded;
            var uploaded_fnct = $scope.uploaded;
            $scope.onFileSelect = function($file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var zip = new JSZip(e.target.result);
                    $scope.uploadToText = convertNodeListToString(convertContent(zip));
                    console.log($scope.uploadToText);
                    console.log("UP: " + uploaded);
                    if(angular.isDefined(uploaded)) {
                        console.log(uploaded_fnct);
                        uploaded_fnct();
                    }
                    $scope.$apply();
                };
                reader.readAsBinaryString($file[0]);
            };
        }
    };
}]);

});