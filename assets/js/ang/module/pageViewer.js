define([
'angular',
'angular-sanatize'
], function(angular) {

angular.module('pageViewer', ['ngSanitize'])
.constant('TEXT_WORD_DELIM', ' ')
.constant('DEFAULT_PAGE_LENGTH', 140)
//TODO: Make HTML tag resistant
.directive('pageViewer',function(TEXT_WORD_DELIM, DEFAULT_PAGE_LENGTH){
  return {
    restrict: 'E',
    templateUrl: '/partials/page-viewer',
    scope: {
        text: '=',
        pageLength: '='
    },
    link: function(scope, element, attrs) {
        (function linkPagesToText() {
            function syncPagesToText() {
                if (!scope.text) {
                    return;
                }
                scope.pages = splitTextEvery(scope.text, scope.pageLength || DEFAULT_PAGE_LENGTH);
                scope.pageNumber = 1;
            }
            function splitTextEvery(text, numWords) {
                wordsArray = text.split(TEXT_WORD_DELIM);
                pagesOfWordsArray = splitArrayEvery(wordsArray, numWords);
                pages = pagesOfWordsArray
                    .map(function(wordsArray) {
                        return wordsArray.join(TEXT_WORD_DELIM);
                    });
                console.log("PAGES: ", pages);
                return pages;
            }
            function splitArrayEvery(array, numWords) {
                var newArray = [];
                for (var i = 0; i*numWords < array.length; i++) {
                    var startOfPage = i*numWords;
                    var endOfPage = (i+1)*numWords;
                    newArray[i] = array.slice(startOfPage, endOfPage);
                }
                return newArray;
            }
            scope.$watch('text', syncPagesToText);
            syncPagesToText();
        })();
        (function pageControls() {
            scope.back = function() {
                if (scope.pageNumber - 1 < 1) {
                    return;
                }
                scope.pageNumber--;
            };
            scope.next = function() {
                if (scope.pageNumber + 1 > scope.pages.length) {
                    return;
                }
                scope.pageNumber++;
            };
        })();
    }
  };
});
    
});