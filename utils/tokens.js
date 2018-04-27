const jwt = require('jsonwebtoken');
const constants = require('../config/constants');
const _ = require('underscore');
const User = require('../models/User.model');
module.exports.readToken = (req) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof  bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        return token;
    } else {
        return null;
    }
};

module.exports.decodeToken = (token) => {

    try {
        let decoded = jwt.verify(token, constants.jwtSecret);
        return decoded;

    } catch (error) {
        return null;
    }
};

module.exports.generateToken = (login, callback) => {
    User.findOne({login}, (errr, user) => {

        jwt.sign(_.pick(user, 'login', 'role', '_id'), constants.jwtSecret, {expiresIn: '1h'}, function (err, token) {

            if (!err)
                callback(token);
            else callback(null);
        });
    });

};

module.exports.requireAgent = (req, res, next) => {
    let decodedToken = module.exports.decodeToken(module.exports.readToken(req));
    if (decodedToken == null) {
        res.status(403).send();

    }
    else {
        if (decodedToken.role == 'Agent') {
            req.userId = decodedToken._id;
            next();
        }
        else {
            res.status(403).send();

        }
    }

};
module.exports.requireUser = (req, res, next) => {
    let decodedToken = module.exports.decodeToken(module.exports.readToken(req));
    if (decodedToken == null) {
        res.status(403).send();

    }
    else {
        if (decodedToken.role == 'User' || decodedToken.role == 'Agent') {
            req.userId = decodedToken._id;
            next();

        }

        else {
            res.status(403).send();

        }
    }
};