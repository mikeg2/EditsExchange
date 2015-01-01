var blank = function(obj, next) {
    next();
};

exports.addAllLifecycleCallbacks = function(model, modelName) {
    exports.addDestroyedLifecycleCallback(model, modelName);
    exports.addUpdatedLifecycleCallback(model, modelName);
    exports.addCreatedLifecycleCallback(model, modelName);
};

exports.addDestroyedLifecycleCallback = function(model, modelName) {
    var oldAfterDestory = model.afterDestory || blank;
    model.afterDestroy = function(obj, next) {
        var Model = this[modelName];
        //Model.publishDestroy(obj.id);
        oldAfterDestroy(obj, next);
    };
};

exports.addUpdatedLifecycleCallback = function(model, modelName) {
    var oldAfterUpdate = model.afterUpdate || blank;
    model.afterUpdate = function(updatedRecord, next) {
        var Model = this[modelName];
        Model.publishUpdate(updatedRecord.id, {});
        oldAfterUpdate(updatedRecord, next);
    };
};

exports.addCreatedLifecycleCallback = function(model, modelName) {
    // var oldAfterCreate = model.afterCreate || blank;
    // model.afterCreate = function(newRecord, next) {
    //     // console.log("NEW RECORD: " + JSON.stringify(newRecord));
    //     // RESTService.RESTify(newRecord).then(function(toRest) {
    //     //     var Model = this[modelName];
    //     //     Model.publishCreate(toRest.id, toRest);
    //     // });
    //     console.log("CALLING OTHER CALLBACK");
    //     oldAfterCreate(newRecord, next);

    // };
};