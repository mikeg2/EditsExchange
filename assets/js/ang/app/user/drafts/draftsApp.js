require([
    'angular',
    'ang/module/userInput',
    'ang/module/modal',
    'ang/module/genre/genreItem',
    'ang/module/util',
    'ang/module/URLManager',
    'ang/module/uploadToText',
    'ang/module/smartPaste',
    'ang/module/draft/draftItem',
    'ang/module/draft/draftDisplay',
    'ang/module/inviter',
    'angular-file-upload',
    'angular-fuse',
    'angular-sanatize'
], function(angular) {

var draftsApp = angular.module('draftsApp', ["util", "URLManager", "inviter", "ngSanitize", "API", "userInput", "draftItem", "draftDisplay", "fuse", "modal", "smartPaste", "uploadToText", "angularFileUpload"]);

//TODO Create a on-enter directive and make it so that if you hit enter in the search bar, it pops up the first option
draftsApp.controller('draftListAreaController', function($scope, $controller, $rootScope, APIUsers) {
    $controller('draftShower', {
        $scope: $scope,
        $rootScope: $rootScope,
    });
    $rootScope.updateDrafts = function() {
        APIUsers.one($scope.user.id).getList('drafts', {
            populate: "genres",
        }).then(function(drafts) {
            console.log("DRAFTS:\n" + JSON.stringify(drafts));
            $scope.user.drafts = drafts;
        }, function(err) {
            console.log("ERROR: " + error);
        });
    };
    $scope.updateDrafts();
});


draftsApp.directive('infiniteChoice', function() {
    // var isAnOptionSelected = function($select) {
    //     var isSelected = false;
    //     $select.children('option').each(function(option) {
    //         if (this.selected) {
    //             isSelected = true;
    //             return false;
    //         }
    //     });
    //     return isSelected;
    // };
    // var areAllSelectsFull = function($element) {
    //     var foundNotSelected = false;
    //     $element.children('select').each(function(element) {
    //         if ($element.is(':visible')) {
    //             foundNotSelected = !isAnOptionSelected($element);
    //             return !foundNotSelected;
    //         }
    //     });
    //     return foundNotSelected;
    // };
    return {
        restrict: 'E',
        replace: true,
        template: '<div><select ng-repeat="select in selects" ng-model="select.val" ng-options="opt[valueProperty] as opt[displayProperty] for opt in options"><option ng-show="select.deletable" id="deleteOption" value=""></option></select></div>',
        require: '?ngModel',
        scope: {
            options: "=",
            valueProperty: "=",
            displayProperty: "=",
            required: "="
        },
        link: function(scope, element, attr, ngModel) {
            $element = $(element);
            scope.selects = [];
            scope.valueProperty = attr.valueProperty;
            scope.displayProperty = attr.displayProperty;

            var remove = function(arr, item) {
                for (var i = arr.length; i--;) {
                    if (arr[i] === item) {
                        arr.splice(i, 1);
                    }
                }
            };
            var addIfNecessary = function() {
                if (areAllSelectsFull($element)) {
                    addAnotherSelect();
                }
            };
            var areAllSelectsFull = function() {
                var allFull = true;
                for (var i = 0; i < scope.selects.length; i++) {
                    if (scope.selects[i].val === undefined) {
                        allFull = false;
                        break;
                    }
                }
                return allFull;
            };
            var addAnotherSelect = function() {
                var select = {
                    val: undefined,
                    remove: function() {
                        remove(scope.selects, this);
                    },
                    deletable: true
                };
                scope.selects.push(select);
            };
            var deleteIfNecessary = function() {
                for (var i = 0; i < scope.selects.length; i++) {
                    if (scope.selects[i].val == undefined && scope.selects.length > 1) {
                        scope.selects.splice(i, 1);
                    }
                }
            };
            scope.selects.push({
                val: undefined,
                deletable: true,
            });
            var getSelectedValues = function() {
                var selectedValues = [];
                for (var i = 0; i < scope.selects.length - 1; i++) { // -1 deletes the empty selector at the end
                    selectedValues[i] = scope.selects[i].val;
                }
                return selectedValues;
            };
            var updateNgModel = function() {
                if (ngModel) {
                    var values = getSelectedValues();
                    ngModel.$setViewValue(values);
                }
            };
            if (ngModel) {
                ngModel.$render = function() {
                    var values = ngModel.$viewValue;
                    for (var i = 0; i < selects.length; i++) {
                        selects[i].val = values[i];
                    }
                };
            }
            scope.$watch('selects', function() {
                console.log("SELECTS: " + JSON.stringify(scope.selects));
                deleteIfNecessary();
                addIfNecessary();
                updateNgModel();
            }, true);
        },
    };
});

draftsApp.controller('newDraftController', function($scope, APIUsers) {
    var startingPage = "new-draft";
    if(!$scope.user.groups) {
        $scope.user.groups = APIUsers.one($scope.user.id).getList('groups').$object;
    }
    $scope.page = {};
    $scope.state = {};
    $scope.$watch(function() {
        return $scope.modal.uploadDraftModal;
    }, function(newVal) {
        if (newVal) {
            $scope.page.name = startingPage;
            $scope.state = {
                draft: undefined
            };
        }
    });
});

draftsApp.controller('newDraftFormController', function($scope, APIUsers, APIGenres) {
    $scope.genreOptions = APIGenres.getList({
        sort: 'name'
    }).$object;
    $scope.submit = function() {
        if (!$scope.newDraft.$valid) {
            return;
        }
        console.log("SUBMIT");
        var data = {};
        data.content = $scope.content;
        data.title = $scope.title;
        data.sample = $scope.sample;
        data.genres = $scope.genres;
        data.groups = $scope.groups;
        data.tagStrings = $scope.tags.split(/\s+,+\s+|,+\s+|\s+,+|,+/)
            .filter(function(value) {
                return value.length !== 0;
            });
        APIUsers.one($scope.user.id).all('drafts').post(data, {
            whitelist: "id"
        }).then(function success(draft) {
            $scope.page.name = "invite-friends";
            $scope.state.draft = draft;
            $scope.clearForm();
        }, function error(er) {
            console.log("ERROR: " + JSON.stringify(er));
        });
    };

    $scope.clearForm = function() {
        $scope.content = "";
        $scope.title = undefined;
        $scope.sample = undefined;
        $scope.genre = undefined;
        $scope.tags = undefined;
        $scope.newDraft.wasSubmit = false;
        $scope.newDraft.$setPristine(true);
    };
});

draftsApp.controller('inviteFriendsController', function($scope, APIDrafts) {
    var draftId = $scope.state.draft.id;
    $scope.draftInviteObject = APIDrafts.one(draftId).all('invites'); // will refresh every time if ng-if is used. 
});


angular.element(document).ready(function() {
  angular.bootstrap(document, ['draftsApp']);
});

});


















