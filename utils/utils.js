var lodash = require('lodash');
var _=require('underscore');

module.exports.pickFromArray = (source,...fields)=>{

    return source.map(lodash.partialRight(_.pick,fields))
}
module.exports.isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};
module.exports.isArray = function(a) {
    return (!!a) && (a.constructor === Array);
};