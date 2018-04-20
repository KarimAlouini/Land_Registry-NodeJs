var cacheConfig = require('../config/CacheConfig');
var Lands = require('../models/Land.model');
var async = require('async');
var request = require('request');
var ObjectId = require('mongoose').Types.ObjectId;

function getLogsFromCache(url) {

    return new Promise(function (resolve, reject) {
        request(url,
            function (error, response, body) {
                if (error) {

                    reject(" problem ");
                }
                else {
                    console.log(body);
                    resolve(JSON.parse(body));
                }
            })
    })
};

module.exports.getAllLands = function (callback) {
    getLogsFromCache(cacheConfig.cacheServerAddress).then(function (LogResult) {

        var lands = [];
        async.forEachOf(LogResult, (logElement, index) => {
            Lands.findOne({_id: logElement.id, 'isForSale': 'true'}, (err, land) => {

                if (!err) {
                    console.log(land !== null);
                    if (land != null) {

                        var l = {};
                        l.info = land;
                        l.history = logElement.info.history;
                        l.hashedInfo = logElement.info.hashedInfo;

                        l.hashDocs = logElement.info.hashDocs;
                        console.log('land');
                        console.log('found a land');
                        lands.push(l);


                    }


                }

                if (index === (LogResult.length - 1)) {
                    console.log(LogResult.length);
                    console.log(index);
                    console.log('equals');
                    return callback({
                        code: 0,
                        data: lands
                    });
                }
            });


        });
        console.log('here');

    })
        .catch(function (error) {
            console.log(error);
            callback({
                code: 1,
                error
            });
        });


};

module.exports.getLand = (id, callback) => {
    console.log(`${cacheConfig.cacheServerAddress}/${id}`);
    getLogsFromCache(`${cacheConfig.cacheServerAddress}/${id}`).then((logResult) => {
        Lands.findOne({_id: logResult.id}, (err, data) => {
            console.log(logResult.history);
            let l = {
                info: data,
                history: logResult.info.history,
                hashedInfo: logResult.info.hashedInfo,
                hashDocs: logResult.info.hashDocs
            };
            return callback({
                code: 0,
                data: l
            })
        });

    })
        .catch((error) => {

            callback({
                code: 1,
                data: error
            })
        });
};

module.exports.getAllLandsNew = (callback) => {
    getLogsFromCache(cacheConfig.cacheServerAddress).then(function (LogResult) {
        var convertedLands = [];
        Lands.find({}, function (err, DBResult) {
            if (err) {
                callback({
                    code: 1,
                    data: err
                })
            }
            else {
                LogResult.forEach(function (object) {
                    var x = DBResult.find(function (element) {
                        return element._id == object.id;
                    });
                    if (x != undefined) {
                        let l = {};
                        l.info = x;
                        convertedLands.push(l);
                    }

                });
                callback({
                    code: 0,
                    data: convertedLands
                })
            }
        });
    }).catch(function (error) {
        callback({
            code: 1,
            data: error
        })
    })
};




