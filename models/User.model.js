var mongoose = require('mongoose');
var Schema =  mongoose.Schema;

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
    cin:{
        type:String,
        required:true,
        unique:true
    },
    dob:{
        type:Date,
        default:Date.now
    },
    walletId:{
        type:String,
        required:true
    }
    //roles
    //user's adding

});
module.exports = mongoose.model('User',userSchema);