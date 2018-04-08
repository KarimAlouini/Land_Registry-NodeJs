var mongoose = require('mongoose'),
    Schema =  mongoose.Schema

 userSchema = new Schema({
     name:{
         type:String,
         required:true
     },
     coords:{
         lng:{
             type:Number,
             required:true
         },
         lat:{
             type:Number,
             required:true
         }
     }
 });
module.exports = mongoose.model('City',userSchema);