require([
    'angular',
], function(angular) {

var appName = '';
var app = angular.module(appName, []);

app.controller();

angular.element(document).ready(function() {
  angular.bootstrap(document, [appName]);
});

});