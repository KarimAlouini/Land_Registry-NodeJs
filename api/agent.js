var express = require('express');
var router = express.Router();
var Lands = require('../models/Land.model');
var User = require('../models/User.model');
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

router.post('/add', (req, res) => {
    var docs = [];
    for (key in req.files) {
        docs.push(req.files[key]);
    }
    var land;
    try {
        land = JSON.parse(req.body.land);
    } catch (e) {
        res.status(500).send("wrong Json");
    }
    var pinsHash = sha256(JSON.stringify(land.pins));
    Lands.find({
        owner: land.owner,
    }, function (err, result) {
        if (err)
            res.status(500).send(err);
        else {

            var notExists = result.every((element) => {
                var a = result.filter((x) => {
                    var myPins = sha256(JSON.stringify(utils.pickFromArray(x.pins, 'longitude', 'latitude')));
                    return myPins === pinsHash;
                });
                if (a.length > 0) {
                    res.status(201).json({
                        code: 1,
                        message: 'Land already exists'
                    });
                    return false;
                }
                return true;
            });
            if (notExists) {
                if (!docs) {
                    res.status(201).json({
                        code: 1,
                        message: 'Documents are required'
                    });
                }
                else {
                    var files = [];
                    var landPath = path.join(__dirname, '..', 'public', 'docs', pinsHash);
                    if (!fs.existsSync(landPath)) {
                        fs.mkdirSync(landPath);
                    }
                    if (isNaN(docs.length)) {
                        files.push(docs);
                        //if it's single file
                        docs.mv(path.join(landPath, docs.name), (err) => {
                            if (err) {
                                res.status(500).send("single file");
                            }
                            else {
                                files.push(docs);
                            }
                        });
                    }
                    else {
                        files = docs;
                        //if it's an array
                        async.forEachOf(docs, (element) => {
                            element.mv(path.join(landPath, element.name), (err) => {
                                if (err) {
                                    res.status(500).send("too many files");
                                }
                                else {
                                    files.push(element);
                                }
                            });
                        });
                    }
                    var l = new Lands(land);
                    l.documents = [];
                    var hashes = '';
                    async.forEachOf(files, (file) => {
                        var readStream = fs.createReadStream(path.join(landPath, file.name));
                        var chunks = '';
                        readStream.on('data', function (chunk) {
                            chunks += chunk;
                        })
                            .on('end', function () {
                                hashes += chunks;
                                var d = new Document({
                                    name: file.name,
                                    hash: sha256(chunks)
                                });
                                d.save((err, dRes) => {
                                });
                            })
                    });
                    l.save((err, data) => {
                        if (err)
                            res.status(500).send("data base error");
                        else {
                            User.find({_id: land.owner}, (err, result) => {
                                var address = constants.appPublicKey;
                                var senderPrivateKey = constants.appPrivateKey;
                                var idland = '' + data._id;
                                var hashedInfos = '' + sha256(data.owner + data.pins);
                                var hashDocs = '' + sha256(hashes);
                                var web3 = new Web3(new Web3.providers.HttpProvider(constants.providerAddress));
                                var DataPassContract = web3.eth.contract(abi);
                                var dataPass = DataPassContract.at(constants.contractAddress);
                                var privateKey = new Buffer(senderPrivateKey, 'hex');
                                var contactFunction = dataPass.add.getData(String(result[0].blockchainAddress), idland, hashedInfos, hashDocs);
                                var number = web3.eth.getTransactionCount(address, "pending");
                                var rawTx = {
                                    nonce: number, // nonce is numbre of transaction (done AND pending) by the account : function to get :  web3.eth.getTransactionCount(accountAddress) + pending transactions
                                    gasPrice: web3.toHex(web3.toWei('1000', 'gwei')),
                                    gasLimit: web3.toHex(3000000),
                                    from: address,
                                    to: constants.contractAddress, // contract address
                                    value: '0x00',
                                    data: String(contactFunction)
                                };
                                var tx = new Tx(rawTx);
                                tx.sign(privateKey);
                                var serializedTx = tx.serialize();
                                var raw = '0x' + serializedTx.toString('hex');
                                //callback
                                web3.eth.sendRawTransaction(raw, function (err, data) {
                                    if (!err)
                                        res.send({
                                            data,
                                            result
                                        });
                                    else
                                        res.send(err);
                                });
                            });
                        }
                    });
                }
            }
        }
    });
});

router.get('/GetLandsFromCache/:flag', function (req, res) {
    getLogsFromCache().then(function (LogResult) {
        var convertedLands = [];
        var search = {};
        if (req.params.flag === 'true') {
            search = {isForSale: 'true'};
        }
        else {
            search = {isForSale: 'false'};
        }
        Lands.find(search, function (err, DBResult) {
            if (err) {
                res.send(err);
            }
            else {
                LogResult.forEach(function (object) {
                    var x = DBResult.find(function (element) {
                        return element._id == object.id;
                    });
                    if (x != undefined)
                        convertedLands.push(x);
                });

                res.json(convertedLands);
            }
        });
    }).catch(function (error) {
        res.send(error);
    })
});

router.post('/addUser', (req, res) => {
    var user = new User(req.body);
    user.password = sha256(user._id + "fd34s@!@dfa453f3DF#$D&W");
    user.save().then((user) => {
            res.send(user);
        },
        (error) => {
            res.send(error);
        }
    )
});


module.exports = router;