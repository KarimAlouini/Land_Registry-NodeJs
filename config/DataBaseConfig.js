var mongoose = require('mongoose');
mongoose.connect('mongodb://quadra:quadra@34.252.123.72:27017/land_registry');
module.exports = mongoose.connection;