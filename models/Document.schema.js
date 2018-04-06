var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var landSchema = new Schema({


    land: {
        type: Schema.ObjectId,
        ref: 'land'
    },
    name: String,
    hash: String,
    dateAdded:
        {
            type: Date,
            default:
            Date.now
        }


});
module.exports = mongoose.model('Document', landSchema);