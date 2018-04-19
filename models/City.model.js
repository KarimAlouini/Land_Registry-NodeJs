var mongoose = require('mongoose'),
    Schema =  mongoose.Schema

 userSchema = new Schema({
     name:{
         type:String,
         required:true
     },
     coords:{

         lat:{
             type:Number,
             required:true
         },
         lng:{
             type:Number,
             required:true
         }
     }
 });
module.exports = mongoose.model('City',userSchema);