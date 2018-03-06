var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var documentSchema = new Schema({


        name: String,
        checksum:
        String,
        dateAdded:
            {
                type: Date,
                default:
                Date.now
            }


    })
;
module.exports = documentSchema;