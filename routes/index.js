var express = require('express');
var router = express.Router();
var db = require('../config/DataBaseConfig');
var Web3 = require('web3');
/* GET home page. */
router.get('/', function(req, res) {

    console.log('here');

    //res.send('hey')
    res.render('index');
});

router.get('/register',(req,res)=>{
   res.render('add-user');
});


router.get('test/:address',(req,res)=>{

    res.send(req.params.address);
});







module.exports = router;
