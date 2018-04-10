var express = require('express');
var router = express.Router();
var geocoder = require('../config/Geocoder');
var City = require('../models/City.model');
var Land = require('../models/Land.model');
var cacheManager = require('../utils/cacheManager');
var ObjectId = require('mongoose').Types.ObjectId;



router.get('/',(req,res)=>{
   cacheManager.getAllLands((response)=>{
       if (response.code === 0)
           res.json(response.data);
       else
           res.status(400).send();
   })
});

module.exports = router;