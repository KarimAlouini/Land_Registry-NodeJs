var express = require('express');
var router = express.Router();
var Lands = require('../models/Land.model');
var User = require('../models/User.model');
const request = require('request')
var Web3 = require('web3');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var privateKey = new Buffer('922bd7a49e2496bf1c3c9b27e71eb1439988f80bf5854034be3d0eabd753660b', 'hex');
const Tx = require('ethereumjs-tx');
var app = express();
var config = require('../config/constants');
app.use(bodyParser.json());
var async = require('async');
var sha256 = require('sha256');
var _ = require('underscore');
var utils = require('../utils/utils');
var fs = require('fs');
var path = require('path');
var Document = require('../models/Document.schema');
var md5 = require('md5');
var constants = require('../config/constants');
var mongoose = require('mongoose');
var objectId = mongoose.Types.ObjectId;
var abi = constants.contractAbi;

var constants = require('../config/constants');
var abi = constants.contractAbi;
var md5 = require('md5');
router.post('/addLand', function (req, res) {

    console.log('addLand');
    var address = String(req.body.address);
    var senderPrivateKey = String(req.body.privateKey);
    var idland = String(req.body.idland);
    var hashedInfos = String(req.body.hashedInfos);
    var hashDocs = String(req.body.hashDocs);

    var web3 = new Web3(new Web3.providers.HttpProvider(constants.providerAddress));
    var DataPassContract = web3.eth.contract(constants.contractAbi);
    var dataPass = DataPassContract.at(constants.contractAddress);
    var privateKey = new Buffer(senderPrivateKey, 'hex');
    var contactFunction = dataPass.add.getData(String(address), idland, hashedInfos, hashDocs);
    var number = web3.eth.getTransactionCount(address, "pending");
    console.log(web3.version);
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
    web3.eth.sendRawTransaction(raw, function (err, data) {
        if (!err)
            res.send(data);
        else
            res.send(err);
    });

});


router.get('/transactionStatus/:hash', function (req, res) {
    var hash = req.params.hash;
    var web3 = new Web3(new Web3.providers.HttpProvider(constants.providerAddress));

    web3.eth.getTransactionReceipt(hash, function (err, data) {
        if (!err)
            res.send(data);
        else
            res.send(err);
    })
});

router.get('/accessCheck/:address', verifyToken, function (req, res) {
    var address = String(req.params.address);
    var web3 = new Web3(new Web3.providers.HttpProvider(constants.providerAddress));
    var DataPassContract = web3.eth.contract(abi);
    var dataPass = DataPassContract.at(constants.providerAddress);
    jwt.verify(req.token, constants.jwtSecret, function (err, authData) {
        if (err || (authData.role != "admin")) {
            res.sendStatus(403);
        } else {
            dataPass.accessCheck.call(address, function (err, result) {
                if (err) {
                    res.send('a problem');
                } else {
                    res.json({"result": result})
                }
            });
        }
    });


});
router.post('/addAgent', function (req, res) {

    var address = String(req.body.SenderAddress);
    var agentAddress = String(req.body.AgentAddress);
    var senderPrivateKey = String(req.body.privateKey);
    var web3 = new Web3(new Web3.providers.HttpProvider(constants.providerAddress));
    var DataPassContract = web3.eth.contract(abi);
    var dataPass = DataPassContract.at('0x9826c4ba142c1e32d74405eba6b2eb3d65cd253b');
    var privateKey = new Buffer(senderPrivateKey, 'hex');
    var contactFunction = dataPass.addAgent.getData(agentAddress);
    var number = web3.eth.getTransactionCount(address, "pending");
    console.log(web3.version);
    var rawTx = {
        nonce: number, // nonce is numbre of transaction (done AND pending) by the account : function to get :  web3.eth.getTransactionCount(accountAddress) + pending transactions
        gasPrice: web3.toHex(web3.toWei('1000', 'gwei')),
        gasLimit: web3.toHex(3000000),
        from: address,
        to: '0x9826c4ba142c1e32d74405eba6b2eb3d65cd253b', // contract address
        value: '0x00',
        data: String(contactFunction)
    };

    var tx = new Tx(rawTx);
    tx.sign(privateKey);

    var serializedTx = tx.serialize();
    var raw = '0x' + serializedTx.toString('hex');
    web3.eth.sendRawTransaction(raw, function (err, data) {
        if (!err)

            res.send(data);
        else
            res.send(err);
    });

});

router.get('/AllTransaction', function (req, res) {
    var web3 = new Web3(new Web3.providers.HttpProvider(constants.providerAddress));
    var DataPassContract = web3.eth.contract(abi);
    var dataPass = DataPassContract.at('0x9826c4ba142c1e32d74405eba6b2eb3d65cd253b');
    var Event = dataPass.LogReturn({}, {fromBlock: 0, toBlock: 'latest'});


    Event.get(function (err, logs) {
        if (!err) {
            var transactions = [];
            for (i = logs.length - 3; i < logs.length; i++) {
                transactions.push({
                    "time": web3.eth.getBlock(logs[i].blockNumber).timestamp,
                    "blockHash": logs[i].blockHash
                });
            }
            ;
            res.json(transactions);
        }
        else {
            throw  err
        }
    });
});
router.get('/GetLandsFromCache', function (req, res) {
    getLogsFromCache(constants.cacheServerAddress).then(function (LogResult) {
        var convertedLands = [];
        Lands.find({}, function (err, DBResult) {
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

router.get('/GetLandsFromCache/:flag', function (req, res) {
    getLogsFromCache().then(function (LogResult) {
        var convertedLands = [];
        var search = {};
        console.log('here');
        if (req.params.flag === 'true') {
            console.log('if');
            search = {isForSale: 'true'};
        }
        else {
            console.log('else');
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


router.get('/getallfromcache', function (req, res) {
    console.log('here');
    getLogsFromCache().then(function (LogResult) {
        var convertedLands = [];


        Lands.find({}, function (err, DBResult) {
            if (err) {
                res.send(err);
            }
            else {
                async.forEachOf(LogResult, function (object, index) {

                    var x = DBResult.find(function (element) {
                        return element._id == object.id;
                    });


                    if (x != undefined) {
                        convertedLands.push(x);

                    }


                });


                var children = [];

                async.forEachOf(convertedLands,(elem,index)=>{
                    Lands.find({'parent':new objectId(elem._id)},(err,result)=>{

                        convertedLands[index].children = result;
                        children.push(result);

                        console.log(convertedLands.length);
                        console.log(children.length);
                        if (convertedLands.length === children.length){
                            console.log('true');
                            res.send(convertedLands);
                        }

                    });



                });




            }
        });
    }).catch(function (error) {
        res.send(error);
    })
});

function getLogsFromCache(url) {
    return new Promise(function (resolve, reject) {
        request(url,
            function (error, response, body) {
                if (error) {
                    reject(" problem ");
                }
                else {
                    resolve(JSON.parse(body));
                }
            })
    })
}


router.post('/divide/:id', (req, res) => {
    Lands.findById(req.params.id, function (err, result) {
        console.log(req.body);
        if (err) {
            res.send(err);
        } else {

            var land = result;
            console.log(land.dividable);
            if (land.dividable === 'false') {

                res.status(400).send();
            }

            else {
                land.documents = [];
                var childrenIds = [];
                async.forEachOf(req.body.children, (child) => {

                    var l = new Lands({
                        owner: land.owner,
                        pins: child.pins,
                        parent: land._id
                    });

                    l.save((err, result) => {


                        console.log(`children length ${childrenIds.length}`);
                        console.log(`body children length ${req.body.children.length}`);
                        childrenIds.push(result._id);

                        if (childrenIds.length === req.body.children.length) {
                            console.log('equals');
                            res.send('ok');
                        }
                    });

                });
            }


        }

    });

});
router.post('/add', (req, res) => {
    console.log("start");
    var docs = [];
    console.log('here');
    for (key in req.files) {
        docs.push(req.files[key]);
    }
    console.log(docs.length);
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
                //var myPins = sha256(JSON.stringify(utils.pickFromArray(element.pins, 'longitude', 'latitude')));
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
            console.log("exist");
            if (notExists) {
                if (!docs) {
                    res.status(201).json({
                        code: 1,
                        message: 'Documents are required'
                    });
                }
                else {
                    var files = [];
                    console.log('start upload');
                    var landPath = path.join(__dirname, '..', 'public', 'docs', pinsHash);
                    if (!fs.existsSync(landPath)) {
                        fs.mkdirSync(landPath);
                    }
                    if (isNaN(docs.length)) {
                        console.log('single file');
                        files.push(docs);
                        //if it's single file
                        docs.mv(path.join(landPath, docs.name), (err) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send("single file");
                            }
                            else {
                                files.push(docs);
                            }
                        });
                    }
                    else {
                        console.log('too many files');
                        files = docs;
                        //if it's an array
                        async.forEachOf(docs, (element) => {
                            element.mv(path.join(landPath, element.name), (err) => {
                                if (err) {
                                    res.status(500).send("too many files");
                                }
                                else {
                                    console.log('no error during upload');
                                    files.push(element);
                                }
                            });
                        });
                    }
                    console.log(files.length);
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

                                console.log(sha256(chunks));
                                hashes += chunks;

                                var d = new Document({
                                    name: file.name,
                                    hash: sha256(chunks)
                                });
                                d.save((err, dRes) => {
                                    console.log(err);
                                    console.log(dRes);
                                });
                            })
                    });
                    l.save((err, data) => {
                        if (err)
                            res.status(500).send("data base error");
                        console.log('added to database');
                        res.json(data);
                    })
                }
            }
        }
    });
});


router.post('/generatToken', function (req, res) {
    jwt.sign(req.body, constants.jwtSecret, {expiresIn: '1h'}, function (err, token) {
        if (!err)
            res.json({'token': token});
    })
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof  bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        req.token = token;
        next();
    } else {
        res.sendStatus(403);
    }


}

router.get('/users/:address', function (req, res) {
    var address = req.params.address;
    User.find({'blockchainAddress': address}, function (err, result) {
        if (err) {
            res.send(err);
        }
        if (result) {
            res.json(result);
        }

    });
});
router.get('/getLandByID/:id', function (req, res) {
    var id = req.params.id;
    Lands.findById(id, function (err, result) {

        if (err) {
            res.send(err);
        } else {

            if (result == null)
                res.status(404).send();


           else{
                var children = [];

                Lands.find({parent: result._id}, (err, result1) => {

                    if(result1){
                        async.forEachOf(result1, (l) => {
                            console.log(l.pins);
                            console.log('here');
                            children.push(l);
                            if (children.length === result1.length) {
                                result.children = children;
                                res.send(result);
                            }
                        });
                    }
                    else
                        res.send(result);
                });
            }

        }

    })

});



module.exports = router;