var express = require('express');
var router = express.Router();
var User = require('../models/User.model');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/add',function (req,res) {
    var u = new User({
        fName:req.body.fName,
        lName:req.body.lName,
        cin:req.body.cin,
        email:req.body.email,
        password:req.body.email,
        login:req.body.login,
        walletId:'xxxx'

    });

    u.save(function (err,u) {
        if(err)
          throw  err;
        console.log(u);
    });
    res.send('hi');
});

module.exports = router;
