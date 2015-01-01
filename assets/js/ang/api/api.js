define([
    'angular',
    'restangular'
], function(angular) {

var apiModule = angular.module('API', ['restangular']);

apiModule.run(function(Restangular) {
    Restangular.setBaseUrl('/api/v0/');
    Restangular.setParentless(false, ['drafts', 'useredits']);
    Restangular.setExtraFields(['comments']);
    Restangular.setSelfLinkAbsoluteUrl(true);
    Restangular.setRestangularFields({
        selfLink: 'self.link'
    });
});

apiModule.factory('PureRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl('http://localhost:1337/');
    });
});

apiModule.factory('APIUsers', function(Restangular) {
    console.log("RESTANG: " + Restangular.service);
    return Restangular.service('users');
});

apiModule.factory('APIDrafts', function(Restangular) {
    return Restangular.service('drafts');
});

apiModule.factory('APIGenres', function(Restangular) {
    return Restangular.service('genres');
});

apiModule.factory('APIChats', function(Restangular) {
    return Restangular.service('chats');
});

apiModule.factory('APIGroups', function(Restangular) {
    return Restangular.service('groups');
});

apiModule.factory('APIDiscussions', function(Restangular) {
    return Restangular.service('discussions');
});

apiModule.factory('APIEdits', function(Restangular) {
    return Restangular.service('edits');
});

apiModule.factory('transformFormDataWithFiles', function() {
    return function (obj) {
        var formData = new FormData();
        for (var key in obj) {
            var value = obj[key];
            if (!value) {
                continue;
            }
            if (!(value instanceof File)) {
                console.log("IS NOT FILE: ", value);
                var parsedValue = value.toString();
                formData.append(key, parsedValue);
            }
        }
        for (key in obj) { // make sure files are last
            var value = obj[key];
            if (!value) {
                continue;
            }
            if (value instanceof File) {
                console.log("IS FILE: ", value);
                formData.append(key, value);
            }
        }
        console.log("FORM DATA: ", formData);
        return formData;
    };
});

});