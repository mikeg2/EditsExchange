define([
'angular',
'ang/module/URLManager'
], function(angular) {

angular.module('userItem', ['URLManager']).directive('userItem', function(URL){
  return {
    restrict: 'AE',
    templateUrl: '/partials/user-item',
//    replace: 'false',
    scope: {
        'user': '=userItem'
    },
    link: function(scope, element, attrs) {
      scope.url = URL;
    }
  };
});

});