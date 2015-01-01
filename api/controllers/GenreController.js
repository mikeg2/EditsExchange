/**
 * GenreController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var q = require('q');
var async = require('async');

function findMostUsedGenres(drafts, num) {
    var genreUsed = findHowOftenGenresAreUsed(drafts);
    console.log("NUM: ", num);
    return !num ? returnKeysForTopNumericValues(genreUsed, 10000000) : returnKeysForTopNumericValues(genreUsed, num); // TODO refactor
}

function findHowOftenGenresAreUsed(drafts) {
    var genreUse = {};
    for (var i = 0; i < drafts.length; i++) {
        var draftsGenres = drafts[i].genres;
        for (var j = 0; j < draftsGenres.length; j++) {
            var genre = draftsGenres[j];
            genreUse[genre] = genreUse[genre] ? genreUse[genre] + 1 : 1;
        }
    }
    return genreUse;
}

function returnKeysForTopNumericValues(dictionary, howMany) {
    var topValues = [];
    var topKeys = [];
    var keys = Object.keys(dictionary);
    for (var i = 0; i < howMany; i++) {
        if (keys.length > i) {
            topKeys[i] = keys[i];
            topValues[i] = dictionary[keys[i]];
        } else {
            break;
        }
    }
    for (i = howMany - 1; i < keys.length; i++) {
        var value = dictionary[keys[i]];
        var indexOfValueLowerThan = getIndexOfValueLowerThan(topValues, value);
        if (indexOfValueLowerThan !== -1) {
            topKeys[indexOfValueLowerThan] = keys[i];
            topValues[indexOfValueLowerThan] = value;
        }
    }
    console.log("TOP KEYS: ", topKeys);
    return topKeys;
}


function getIndexOfValueLowerThan(array, value) {
    for (var i = 0; i < array.length; i++) {
        var arrayValue = array[i];
        if (value > arrayValue) {
            return i;
        }
    }
    return -1;
}

function populateGenreIdArray(genres) {
    var promiser = q.defer();
    var populated = [];
    async.map(genres, function(genreId, cb) {
        Genre.findOne(genreId).then(function(genre) {
            cb(null, genre);
        });
    }, function(err, result) {
        if (err) {
            return promiser.reject(err);
        }
        promiser.resolve(result);
    });
    return promiser.promise;
}

//TODO Reorganize where functions are for sub-elements
module.exports = {

    find: function(req, res) {
        ActionUtil.createQueryForRequest(Genre, req)
            .where({
                id: req.param('genre_id')
            })
            .exec(function(err, genres) {
                if (err) {
                    return res.send(500);
                } else if (genres.length === 0) {
                    return res.send(404);
                }
                RESTService.RESTify(genres[0]).then(function(RESTifiedGenre) {
                    return res.send(RESTifiedGenre, 200);
                });
            });
    },

    findAll: function(req, res) {
        ActionUtil.createQueryForRequest(Genre, req).exec(function(err, genres) {
            if (err) {
                return res.send(500);
            }
            RESTService.RESTify(genres).then(function(RESTifiedGenres) {
                return res.send(RESTifiedGenres, 200);
            });
        });
    },

    findAllForDraft: function(req, res) {
        Draft.findOne(req.param('draft_id'))
            .populate('genres', ActionUtil.criteriaFor(req)) //,   <-- Need to add back in
        .then(function(draft) {
            return RESTService.RESTify(draft.genres);
        }).then(function(RESTifiedGenres) {
            return res.send(RESTifiedGenres, 200);
        });
    },

    findFavoritesForUser: function(req, res) {
        User.findOne(req.param('user_id'))
            .populate('drafts')
            .then(function(user) {
                genres = findMostUsedGenres(user.drafts, ActionUtil.parseLimit(req));
                return populateGenreIdArray(genres);
            }).then(function(genres) {
                return RESTService.RESTify(genres);
            }).then(function(RESTifiedGenres) {
                return res.send(RESTifiedGenres, 200);
            }).fail(function(err) {
                return res.send(err, 500);
            });
    },


    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to GenreController)
     */
    _config: {}


};