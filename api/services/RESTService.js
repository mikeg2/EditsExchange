var async = require('async');
var q = require('q');
var _ = require('lodash');

var RESTify = exports.RESTify = function(objOrArray) {
    if (objOrArray instanceof Array) {
        return RESTifyArray(objOrArray);
    } else {
        return RESTifySingle(objOrArray);
    }
};

var RESTifyArray = exports.RESTifyArray = function(objs) {
    var defered = q.defer();
    async.map(objs, function(obj, callback) {
        RESTifySingle(obj).then(function(objRESTed) {
            callback(null, objRESTed);
        }, function(err) {
            callback(err);
        });
    }, function(err, result) {
        if (err) {
            defered.reject(err);
        } else {
            defered.resolve(result);
        }
    });
    return defered.promise;
};

var RESTifySingle = exports.RESTifySingle = function(obj) {
    return getRESTifyPromiseForObject(obj).then(function(objRESTifiedAllButAssociations) {
        return RESTifyAssociations(obj, objRESTifiedAllButAssociations);
    });
};

function getRESTifyPromiseForObject(obj) {
    if (obj.toRESTasync !== undefined) {
        return obj.toRESTasync();
    } else {
        var deferred = q.defer();
        deferred.resolve(obj.toREST());
        return deferred.promise;
    }
}

function RESTifyAssociations(waterlineObject, jsonObject) {
    var keys = Object.keys(jsonObject);
    var diferred = q.defer();
    async.each(keys, function(key, done) {
        if (!canBeRESTified(waterlineObject[key])) {
            return done();
        }
        RESTify(waterlineObject[key]).then(function(RESTifiedObj) {
            jsonObject[key] = RESTifiedObj;
            done();
        }, function(err) {
            diferred.reject(err);
        });
    }, function() {
        diferred.resolve(jsonObject);
    });
    return diferred.promise;
}

function canBeRESTified(obj) {
    if (!obj) {
        return false;
    } else if (obj.toRESTasync || obj.toREST) {
        return true;
    } else {
        return false;
    }
}