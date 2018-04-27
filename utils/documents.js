const fs = require('fs');
const path = require('path');
const docsPath = path.join(__dirname, '..', 'public', 'docs');
const Land = require('../models/Land.model');
const Document = require('../models/Document.schema');
const async = require('async');
module.exports.getLandDocuments =
    function (landId, callback) {
        Document.find({_id: landId}, (err, docs) => {

            if (err)
                callback({
                    code: 1
                });
            else {
                return callback({code: 0, data: docs});
            }


        });

    };

