/**
 * Module dependencies
 */

var _ = require('lodash'),
    async = require('async'),
    q = require('q'),
    util = require('util');


// Parameter used for jsonp callback is constant, as far as
// blueprints are concerned (for now.)
var JSONP_CALLBACK_PARAM = 'callback';

var DEFAULT_DEFAULT_LIMIT = undefined;


/**
 * Utility methods used in built-in blueprint actions.
 *
 * @type {Object}
 */
var actionUtil = module.exports = {
    RESTifySend: function(req, res, objects) {
        var self = this;
        return RESTService.RESTify(objects).then(function(RESTedObjects) {
            return self.postQueryFilter(req, RESTedObjects);
        }, function() {
            res.send(500);
        }).then(function(filteredObjects) {
            return res.send(filteredObjects, 200);
        });
    },

    postQueryFilter: function(req, objects) {
        var promiser = q.defer();
        var array = objects instanceof Array;
        if (!array) { // normalizes interface to work with arrays or objects
            objects = [objects];
        }
        var resolve = function(obj) {
            if (array) {
                promiser.resolve(obj);
            } else {
                promiser.resolve(obj[0]);
            }
        };
        async.map(objects, function(obj, cb) {
            if (req.param('blacklist')) {
                var blacklisted = _.omit(obj, req.param('blacklist'));
                cb(null, blacklisted);
            } else if (req.param('whitelist')) {
                var whitelisted = _.pick(obj, req.param('whitelist'));
                cb(null, whitelisted);
            } else {
                cb(null, obj);
            }
        }, function(err, objs) {
            resolve(objs);
        });

        return promiser.promise;
    },

    addSubscription: function(req, Model, obj) {
        if (!req.isSocket) {
            return;
        }
        Model.subscribe(req.socket, obj.id);
        actionUtil.subscribeDeep(req, obj);
    },

    createQueryForRequest: function(Model, req, where) {
        var query;
        query = Model.find(this.criteriaFor(req, where));
        query = actionUtil.populateEach(query, req, Model);
        return query;
    },

    criteriaFor: function(req, where) {
        var criteria = {
            where: where || actionUtil.parseWhere(req),
            limit: actionUtil.parseLimit(req),
            skip: actionUtil.parseSkip(req),
            sort: actionUtil.parseSort(req)
        };
        return criteria;
    },

    /**
     * Given a Waterline query, populate the appropriate/specified
     * association attributes and return it so it can be chained
     * further ( i.e. so you can .exec() it )
     *
     * @param {Query} query [waterline query object]
     * @param {Request} req
     * @return {Query}
     */
    populateEach: function(query, req, Model, defaultLimit) {
        var DEFAULT_POPULATE_LIMIT = defaultLimit || DEFAULT_DEFAULT_LIMIT;
        var _options = req.options;
        var aliasFilter = req.param('populate');
        var shouldPopulate = _options.populate;

        // Convert the string representation of the filter list to an Array. We
        // need this to provide flexibility in the request param. This way both
        // list string representations are supported:
        // /model?populate=alias1,alias2,alias3
        // /model?populate=[alias1,alias2,alias3]
        if (typeof aliasFilter === 'string') {
            aliasFilter = aliasFilter.replace(/\[|\]/g, '');
            aliasFilter = (aliasFilter) ? aliasFilter.split(',') : [];
        }
        return _(Model.associations).reduce(function populateEachAssociation(query, association) {

            // If an alias filter was provided, override the blueprint config.
            if (aliasFilter) {
                shouldPopulate = _.contains(aliasFilter, association.alias);
            }

            // Only populate associations if a population filter has been supplied
            // with the request or if `populate` is set within the blueprint config.
            // Population filters will override any value stored in the config.
            //
            // Additionally, allow an object to be specified, where the key is the
            // name of the association attribute, and value is true/false
            // (true to populate, false to not)
            if (shouldPopulate) {
                var populationLimit =
                    _options['populate_' + association.alias + '_limit'] ||
                    _options.populate_limit ||
                    _options.limit ||
                    DEFAULT_POPULATE_LIMIT;
                return query.populate(association.alias, {
                    limit: populationLimit
                });
            } else return query;
        }, query);
    },

    /**
     * Subscribe deep (associations)
     *
     * @param {[type]} associations [description]
     * @param {[type]} record [description]
     * @return {[type]} [description]
     */
    subscribeDeep: function(req, record) {
        _.each(req.options.associations, function(assoc) {

            // Look up identity of associated model
            var ident = assoc[assoc.type];
            var AssociatedModel = sails.models[ident];

            if (req.options.autoWatch) {
                AssociatedModel.watch(req);
            }

            // Subscribe to each associated model instance in a collection
            if (assoc.type === 'collection') {
                _.each(record[assoc.alias], function(associatedInstance) {
                    AssociatedModel.subscribe(req, associatedInstance);
                });
            }
            // If there is an associated to-one model instance, subscribe to it
            else if (assoc.type === 'model' && record[assoc.alias]) {
                AssociatedModel.subscribe(req, record[assoc.alias]);
            }
        });
    },


    parseWhere: function(req) {
        var whereString = req.param("where");
        if (!whereString) {
            return undefined;
        }
        var obj = JSON.parse(whereString);
        return obj;
    },

    /**
     * Parse primary key value for use in a Waterline criteria
     * (e.g. for `find`, `update`, or `destroy`)
     *
     * @param {Request} req
     * @return {Integer|String}
     */
    parsePk: function(req) {

        var pk = req.options.id || (req.options.where && req.options.where.id) || req.param('id');

        // TODO: make this smarter...
        // (e.g. look for actual primary key of model and look for it
        // in the absence of `id`.)
        // See coercePK for reference (although be aware it is not currently in use)

        return pk;
    },



    /**
     * Parse primary key value from parameters.
     * Throw an error if it cannot be retrieved.
     *
     * @param {Request} req
     * @return {Integer|String}
     */
    requirePk: function(req) {
        var pk = module.exports.parsePk(req);

        // Validate the required `id` parameter
        if (!pk) {

            var err = new Error(
                'No `id` parameter provided.' +
                '(Note: even if the model\'s primary key is not named `id`- ' +
                '`id` should be used as the name of the parameter- it will be ' +
                'mapped to the proper primary key name)'
            );
            err.status = 400;
            throw err;
        }

        return pk;
    },



    // /**
    //  * Parse `criteria` for a Waterline `find` or `update` from all
    //  * request parameters.
    //  *
    //  * @param {Request} req
    //  * @return {Object} the WHERE criteria object
    //  */
    // parseCriteria: function(req) {

    //     // Allow customizable blacklist for params NOT to include as criteria.
    //     req.options.criteria = req.options.criteria || {};
    //     req.options.criteria.blacklist = req.options.criteria.blacklist || ['limit', 'skip', 'sort', 'populate'];

    //     // Validate blacklist to provide a more helpful error msg.
    //     var blacklist = req.options.criteria && req.options.criteria.blacklist;
    //     if (blacklist && !_.isArray(blacklist)) {
    //         throw new Error('Invalid `req.options.criteria.blacklist`. Should be an array of strings (parameter names.)');
    //     }

    //     // Look for explicitly specified `where` parameter.
    //     var where = req.params.all().where;

    //     // If `where` parameter is a string, try to interpret it as JSON
    //     if (_.isString(where)) {
    //         where = tryToParseJSON(where);
    //     }

    //     // If `where` has not been specified, but other unbound parameter variables
    //     // **ARE** specified, build the `where` option using them.
    //     if (!where) {

    //         // Prune params which aren't fit to be used as `where` criteria
    //         // to build a proper where query
    //         where = req.params.all();

    //         // Omit built-in runtime config (like query modifiers)
    //         where = _.omit(where, blacklist || ['limit', 'skip', 'sort']);

    //         // Omit any params w/ undefined values
    //         where = _.omit(where, function(p) {
    //             if (_.isUndefined(p)) return true;
    //         });

    //         // Omit jsonp callback param (but only if jsonp is enabled)
    //         var jsonpOpts = req.options.jsonp && !req.isSocket;
    //         jsonpOpts = _.isObject(jsonpOpts) ? jsonpOpts : {
    //             callback: JSONP_CALLBACK_PARAM
    //         };
    //         if (jsonpOpts) {
    //             where = _.omit(where, [jsonpOpts.callback]);
    //         }
    //     }

    //     // Merge w/ req.options.where and return
    //     where = _.merge({}, req.options.where || {}, where) || undefined;

    //     return where;
    // },


    /**
     * Parse `values` for a Waterline `create` or `update` from all
     * request parameters.
     *
     * @param {Request} req
     * @return {Object}
     */
    parseValues: function(req) {

        // Allow customizable blacklist for params NOT to include as values.
        req.options.values = req.options.values || {};
        req.options.values.blacklist = req.options.values.blacklist;

        // Validate blacklist to provide a more helpful error msg.
        var blacklist = req.options.values.blacklist;
        if (blacklist && !_.isArray(blacklist)) {
            throw new Error('Invalid `req.options.values.blacklist`. Should be an array of strings (parameter names.)');
        }

        // Prune params which aren't fit to be used as `values`
        values = req.params.all();

        // Omit built-in runtime config (like query modifiers)
        values = _.omit(values, blacklist || []);

        // Omit any params w/ undefined values
        values = _.omit(values, function(p) {
            if (_.isUndefined(p)) return true;
        });

        // Omit jsonp callback param (but only if jsonp is enabled)
        var jsonpOpts = req.options.jsonp && !req.isSocket;
        jsonpOpts = _.isObject(jsonpOpts) ? jsonpOpts : {
            callback: JSONP_CALLBACK_PARAM
        };
        if (jsonpOpts) {
            values = _.omit(values, [jsonpOpts.callback]);
        }

        return values;
    },



    /**
     * @param {Request} req
     */
    parseSort: function(req) {
        return req.param('sort') || req.options.sort || undefined;
    },

    /**
     * @param {Request} req
     */
    parseLimit: function(req, defaultLimit) {
        var DEFAULT_LIMIT = defaultLimit || DEFAULT_DEFAULT_LIMIT;
        var limit = req.param('limit') || (typeof req.options.limit !== 'undefined' ? req.options.limit : DEFAULT_LIMIT);
        if (limit) {
            limit = +limit;
        }
        return limit;
    },


    /**
     * @param {Request} req
     */
    parseSkip: function(req) {
        var DEFAULT_SKIP = 0;
        var skip = req.param('skip') || (typeof req.options.skip !== 'undefined' ? req.options.skip : DEFAULT_SKIP);
        if (skip) {
            skip = +skip;
        }
        return skip;
    }
};