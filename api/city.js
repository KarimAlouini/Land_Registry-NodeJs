var express = require('express');
var router = express.Router();
var geocoder = require('../config/Geocoder');
var City = require('../models/City.model');
var Land = require('../models/Land.model');
var cacheManager = require('../utils/cacheManager');
var ObjectId = require('mongoose').Types.ObjectId;
var geocoderClient = require('../config/Geocoder');

router.get('/', (req, res) => {
    City.find({}, (err, result) => {
        if (err)
            res.status(401).send();
        else
            res.json({items:result});
    }).sort({name:1})
});

router.get('/byname/:name', async (req, res) => {


    let name = req.params.name;
    let cityRst = await City.findOne({name: {$regex: name}});
    let ret = {};

    if (cityRst == null) {
        let geocoderRst = await geocoder.geocode(`${name},Tunisia`);
        console.log(`geocoder result ${geocoderRst == ''}`);
        if (geocoderRst.length != 0) {
            let c = new City({
                name: geocoderRst[0].city,
                coords: {
                    lng: geocoderRst[0].longitude,
                    lat: geocoderRst[0].latitude
                }
            });
            console.log(geocoderRst);
            c.save((err, addResult) => {
                ret = {
                    name: addResult.name,
                    lat: addResult.coords.lat,
                    lng: addResult.coords.lng
                };
                console.log(`${ret} added to db`);
                res.json(ret);

            });
        }
        else {
            ret.items = {
                name: geocoderRst[0].city,
                coords: {
                    lng: geocoderRst[0].longitude,
                    lat: geocoderRst[0].latitude
                }
            };
            console.log(`from geocoder ${ret}`);
            res.json(ret);
        }
    }
    else {
        ret = {
            name: cityRst.name,
            lng: cityRst.coords.lng,
            lat: cityRst.coords.lat
        };
        res.json(ret);
    }


});
module.exports = router;