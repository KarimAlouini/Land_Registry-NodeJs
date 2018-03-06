var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    documentSchema = require('./Document.schema'),
    _ = require('underscore');


var landSchema = new Schema({

    owner: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    localization: {

        street: String,
        city: String,
        number: Number,
        zipCode: Number,

        coordinates: {
            longitude: Number,
            latitude: Number
        },
        shape: {
            type: String,
            required: true,
            validation:function(v){
                const shapes = ['rectangular ','triangular ','irregular'];
                return _.indexOf(shapes,v) == -1 ;
            }
        },
        documents: [documentSchema
        ],
        adjacentLands: [{
            type: Schema.ObjectId,
            ref: 'Land'
        }]
    }

});
module.exports = mongoose.model('Land', landSchema);