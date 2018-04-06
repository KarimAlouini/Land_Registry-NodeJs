var express = require('express');
var router = express.Router();
var User = require('../models/User.model');


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



    var u = new User(JSON.parse(JSON.stringify(req.body)));


    u.save().then(function () {
        console.log('ok');
    }).catch(function (reason) {
        console.log(reason);
    });

    res.status(400).send();


});


router.get('/',function (req,res) {
    User.find({},function (err,us) {
        console.log(us);
        res.json(us);
    });


});


router.get('/info/:address',(req,res)=>{
    User.findOne({blockchainAddress:req.params.address},(err,data)=>{
        console.log(data);
        res.render('navbar',{login:data.login});
    })

});

module.exports = router;
