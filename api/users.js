var express = require('express');
var router = express.Router();
var md5 = require('js-md5');
var User = require('../models/User.model');
const tokensUtil = require('../utils/tokens');
router.post('/', function (req, res) {


    var login = req.body.login;
    var pwd = req.body.pwd;
    console.log('here.log');
    User.findOne({login: login, password: md5(pwd)}, function (err, result) {

        if (err)
            res.status(401).send();

        if (result == null) {
            res.status(401).send();
        }
        else {
            tokensUtil.generateToken(result.login, (token) => {
                res.json({
                    userInfo: result,
                    token
                });
            });
        }
    });


});
router.get('/info/:id', tokensUtil.requireAgent,(req, res,next) => {
    console.log(req);
    User.findOne({_id: req.params.id}, {password: 0}, (err, result) => {
        if (err)
            res.status(401).send();
        else {
            if (result == null)
                res.status(404).send();
            else {
                res.json(result);
            }
        }
    });


});

module.exports = router;