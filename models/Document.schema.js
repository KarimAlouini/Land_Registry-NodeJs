
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,


    documentModel = new Schema({


        name: String,
        hash: String,
        dateAdded:
            {
                type: Date,
                default:
                Date.now
            }


    });
module.exports = mongoose.model('Document', documentModel);
