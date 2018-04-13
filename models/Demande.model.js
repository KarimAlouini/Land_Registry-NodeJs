var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore');


var landSchema = new Schema({
    seller: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
        validation: {
            message: 'seller is required'
        }
    },
    buyer: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
        validation: {
            message: 'buyer is required'
        }
    },
    land:{
        type: Schema.ObjectId,
        ref: 'Land',
        required: true,
        validation: {
            message: 'land is required'
        }
    },
    confirmBySeller: {
        status:{
            type: Boolean,
            default: false,
        },
        day:{
            type:Date
        }

    },
    confirmByAgent: {
        status:{
            type: Boolean,
            default: false,
        },
        day:{
            type:Date
        }
    },
    dateAdded:{
        type:Date,
        default:Date.now()
    }
});
module.exports = mongoose.model('Land', landSchema);