var mongoose = require('mongoose'),
    Schema =  mongoose.Schema,
    documentSchema = require('./Document.schema'),
    _ = require('underscore'),

 userSchema = new Schema({
    login:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    fName:{
        type:String,
        required:true,
        trim:true
    },
    lName:{
        type:String,
        required:true,
        trim:true
    },
    idCard:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },

    blockchainAddress:{
        type:String,
        required:true,
        trim:true
    },
     role:{
        type:String,
         default:'User',
         validate:(v)=>{
             return _.indexOf(['User','Agent'],v) !== -1;
         }
     }

});
module.exports = mongoose.model('User',userSchema);