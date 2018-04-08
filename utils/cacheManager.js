var constants = require('../config/constants');
var Lands = require('../models/Land.model');
var async = require('async');
var request = require('request');
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
    var ret='xx';
    getLogsFromCache(constants.cacheServerAddress).then(function (LogResult) {


        var convertedLands = [];
        Lands.find({}, function (err, DBResult) {
           // console.log(DBResult);
            if (err) {
              callback({
                  code:1,
                  err
              });
            }
            else {

                async.forEachOf(LogResult,function (object,index) {
                    console.log(index);
                    var x = DBResult.find(function (element) {
                        return element._id == object.id;
                    });
                    if (x != undefined)
                        convertedLands.push(x);
                });

            }

            callback({
                code:0,
                data:convertedLands
            });
        });
    }).catch(function (error) {
        callback( {
            code:1,
            error
        });
    });

    return ret;
};

