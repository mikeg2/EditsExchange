exports.synchronizePromise = function(promise) {
    var value;
    promise.then(function(promiseValue) {
        value = promiseValue;
    });
    while (!value) {}
    return value;
};