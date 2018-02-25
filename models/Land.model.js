var mongoose = require('mongoose'),
    Schema =  mongoose.Schema;


var landSchema = new Schema({

   owner:{
       type:Schema.ObjectId,
       ref:'User'
   },
    localisation:{
       address:{
           street:String,
           city:String,
           number:Number,
           zipCode:Number
       },
        coordinates:{
           longitude:Number,
           latitude:Number
        },
        documents:[{
           name:String,
            checksum:String,
            dateAdded:{
               type:Date,
                default:Date.now
            }
        }]
    }

});
module.exports = mongoose.model('Land',landSchema);