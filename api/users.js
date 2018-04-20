var express = require('express');
var router = express.Router();
var md5 = require('js-md5');
var User = require('../models/User.model');
router.post('/AgentLogin', function (req, res) {

    var login = req.body.login;
    var pwd = req.body.pwd;
    User.find({'login': login, 'password': md5(pwd)}, function (err, result) {
        if (err) {
            res.send(err);
        }
        if (result) {
            if (result.length == 0) {
                res.status(401).send();
            }
            res.json(result[0]);
        }

    });


});

module.exports = router;