var mongoose = require('mongoose'),
    Schema =  mongoose.Schema,
    documentSchema = require('./Document.schema');

var userSchema = new Schema({
    login:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    fName:{
        type:String,
        required:true
    },
    lName:{
        type:String,
        required:true
    },
    idCard:{
        type:String,
        required:true,
        unique:true
    },

    blockchainAddress:{
        type:String,
        required:true
    },
    documents:[
        documentSchema
    ]
    //roles
    //user's adding

});
module.exports = mongoose.model('User',userSchema);