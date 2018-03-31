var mongoose = require('mongoose'),
    Schema = mongoose.Schema,


 documentSchema = new Schema({


        hash: {
            type: String,
            required: true,

        },
        docs: [
            {
                name: String,
                checksum:
                String,
                dateAdded:
                    {
                        type: Date,
                        default:
                        Date.now
                    }
            }
        ]


    })
;
module.exports = documentSchema;