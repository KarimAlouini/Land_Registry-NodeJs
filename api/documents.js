var express = require('express');
var router = express.Router();
var Lands = require('../models/Land.model');
var User = require('../models/User.model');
var Demande = require('../models/Demande.model');
var bodyParser = require('body-parser');
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
var cacheManager = require("../utils/cacheManager");
const documentsUtil = require('../utils/documents');
router.get('/:land', (req, res) => {
    documentsUtil.getLandDocuments(req.params.land, (resp) => {
        res.json(resp.data);
    })
});
module.exports = router;