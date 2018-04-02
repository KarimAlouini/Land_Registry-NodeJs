var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    documentSchema = require('./Document.schema'),
    _ = require('underscore');


var landSchema = new Schema({

    salePrice:{
        type:Number,
        required:false
    },
    isForSale:{
        type:Boolean,
        default:false
    },
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




        adjacentLands: [{
            type: Schema.ObjectId,
            ref: 'Land'
        }]
    },
    documents: documentSchema,
    pins:[{
        longitude:{
            type:Number,
            required:true
        },
        latitude:{
            type:Number,
            required:true
        },
        reference:{
            type:String,
            required:true
        }
    }]

});
module.exports = mongoose.model('Land', landSchema);