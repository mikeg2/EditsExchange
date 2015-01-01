var async = require('async');
var q = require('q');

exports.getSubArray = function(array, param) {
    var newArray = [];
    for (var i = 0; i < array.length; i++) {
        newArray[i] = array[i][param];
    }
    return newArray;
};

exports.convertIdsToObjects = function(Model, ids) {
    var promiser = q.defer();
    async.map(ids, function(id, callback) {
        Model.findOne(id).then(function(obj) {
            callback(null, obj);
        });
    }, function(err, result) {
        if (err) {
            return promiser.reject(err);
        }
        promiser.resolve(result);
    });
    return promiser.promise;
};