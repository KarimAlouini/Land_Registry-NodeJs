var mongoose = require('mongoose');

//change to local database if you run into any problems :)

var connection = mongoose.connect('mongodb://quadra:quadra@34.252.123.72:27017/land_registry');
//var connection = mongoose.connect('mongodb://127.0.0.1/land_registry');






connection
    .then(()=>{
        console.log('database connection established');
    })
    .catch(()=>{
        console.log('error connecting to database');
    });
module.exports = mongoose.connection;