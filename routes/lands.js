var express = require('express');
var router = express.Router();
var Land = require('../models/Land.model');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/add',function (req,res) {


    var l = new Land({
       owners:['5a8f3a174608dc11e827c01c'],
        localisation:{
           address:{
               street:'strt',
               number:5,
               zipCode:9070
           },
            coordinates:{
               longitude:14,
                latitude:36
            }
        }
    });
    l.save(function (err,l) {
       if (err)
           throw err;
        console.log(l);
    });
    res.send('hi');
});

module.exports = router;
