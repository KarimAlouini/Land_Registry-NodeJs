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

                    if (land !== null) {
                        var l = {};
                        l.info = land;
                        l.history = logElement.info.history;
                        l.hashedInfo = logElement.info.hashedInfo;

                        l.hashDocs = logElement.info.hashDocs;
                        console.log('land');

                        lands.push(l);

                    }
                    else {

                        if (index === (LogResult.length - 2)) {
                            callback({
                                code:0,
                                data:lands
                            })

                        }
                    }
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

