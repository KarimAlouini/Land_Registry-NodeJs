var express = require('express');
var router = express.Router();
var geocoder = require('../config/Geocoder');
var City = require('../models/City.model');
var Land = require('../models/Land.model');
var cacheManager = require('../utils/cacheManager');
var ObjectId = require('mongoose').Types.ObjectId;
router.get('/getLandByCity/:id/:flag', (req, res) => {
    var cityId = req.params.id;
    var flag = req.params.flag;
    var search = {};
    if (flag === 'forsale') {
        search = {'localization.city': new ObjectId(cityId), 'isForSale': 'true'};
    }
    else if (flag === 'all') {
        search = {'localization.city': new ObjectId(cityId)}
    }


    console.log(cityId);
    /*  geocoder.geocode(cityName)
          .then(function(result) {
              res.json(result);
          })
          .catch(function(err) {
              console.log(err);
          });*/
    console.log(new ObjectId(cityId));

    Land.find(search, (err, result) => {
        console.log(result.length);
        if (err)
            res.json(err);
        else
            res.json(result);
    })


});


router.get('/getLandByLngLat/:lng/:lat', (req, res) => {
    //console.log(req.params.lat);
    geocoder.reverse({lat: req.params.lat, lon: req.params.lng}, function (err, result) {
        res.send(result);
    });

});

router.get('/getCities/:city', (req, res) => {
    var city = req.params.city;
    console.log('city ' + city);
    if (city === '') {
        console.log('here');
        City.find({}, (err, result) => {
            res.json({
                items: result
            });
        })
    }
    else {
        City.find({name: new RegExp(city, 'i')}, (err, result) => {
            console.log(err);
            res.json({
                items: result
            });
        })
    }
});

router.get('/', (req, res) => {

    cacheManager.getAllLands((result) => {
        if (result.code === 0)
            res.send(result.data)
        else
            res.status(401).send;
    })
});

module.exports = router;