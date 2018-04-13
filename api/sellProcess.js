var express = require('express');
var router = express.Router();
var Lands = require('../models/Land.model');
var Demande = require('../models/Demande.model');
var Web3 = require('web3');
var bodyParser = require('body-parser');
const Tx = require('ethereumjs-tx');
var app = express();
app.use(bodyParser.json());
var async = require('async');
var sha256 = require('sha256');
var utils = require('../utils/utils');
var fs = require('fs');
var path = require('path');
var constants = require('../config/constants');
var abi = constants.contractAbi;
var Document = require('../models/Document.schema');

router.post('/askToBuy',function(req,res){
    var demande = new Demande(req.body);
    demande.save().then((demande) => {
            res.send(demande);
        },
        (error) => {
            res.send(error);
        }
    )
});



module.exports = router;