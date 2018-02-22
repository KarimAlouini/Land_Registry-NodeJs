var mongoose = require('mongoose'),
    Schema =  mongoose.Schema;


var landSchema = new Schema({

   owners:[{
       type:Schema.ObjectId,
       ref:'User'
   }],
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
            checksum:String
        }]
    }

});
module.exports = mongoose.model('Land',landSchema);