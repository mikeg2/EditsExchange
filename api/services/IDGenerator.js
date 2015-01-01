var makeid = exports.createID = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

var createAddID = function(length) {
    return function(values, next) {
        values.id = makeid(length);
        next();
    };
};

var fillerFunction = function(values, cb) {
    cb();
};

exports.addIDtoModel = function(model, length) {
    var oldBeforeCreate = model.beforeCreate || fillerFunction;
    var addId = createAddID(length);
    model.beforeCreate = function(values, next) {
        oldBeforeCreate(values, function() {
            addId(values, next);
        });
    };
};