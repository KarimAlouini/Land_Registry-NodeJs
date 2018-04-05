var express = require('express');
var router = express.Router();
var Lands = require('../models/Land.model');
const request= require('request')

var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());


router.get('/',function (req,res) {
    Lands.find({},function (err,data) {
        if (err)
            res.status(500).send();
        else{
            res.json(data);
        }
    })
});
router.post('/add',function (req,res) {
    var new_land =new Lands(req.body);
    new_land.save(function (err,data) {
        if (err)
            res.send(err);
        res.json(data);
    })
});


module.exports=router;