var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/land_registry');
module.exports = mongoose.connection;