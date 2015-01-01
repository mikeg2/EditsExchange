angular.module('fuse', []).filter('fuzzy', function() {
    var update = function(list, search_term, search_fields, threshold) {
        if (search_term == undefined || search_term.length === 0) {
            return list;
        }
        if (threshold === undefined) {
            threshold = 0.5;
        }
        var options = {
            keys: search_fields,
            threshold: threshold,
            maxPatternLength: 10000
        };
        var f = new Fuse(list, options);
        try {
            return f.search(search_term);
        } catch (excepiton) {
            return [];
        }
    };
    return function(list, search_term, search_fields, threshold) {
        return update(list, search_term, search_fields, threshold);
    };
});