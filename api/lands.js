var express = require('express');
var router = express.Router();
var Lands = require('../models/Land.model');
var User = require('../models/User.model');
const request = require('request')
var Web3 = require('web3');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
const Tx = require('ethereumjs-tx');
var app = express();
app.use(bodyParser.json());
var async = require('async');
var constants = require('../config/constants');
var cacheConfig = require('../config/CacheConfig');
var abi = constants.contractAbi;

router.post('/addLand', function (req, res) {

        console.log('addLand');
        var address = String(req.body.address);
        var senderPrivateKey = String(req.body.privateKey);
        var idland = String(req.body.idland);
        var hashedInfos = String(req.body.hashedInfos);
        var hashDocs = String(req.body.hashDocs);

        var web3 = new Web3(new Web3.providers.HttpProvider(constants.providerAddress));
        var DataPassContract = web3.eth.contract(abi);
        var dataPass = DataPassContract.at(constants.contractAddress);
        var privateKey = new Buffer(senderPrivateKey, 'hex');
        var contactFunction = dataPass.add.getData(String(address), idland, hashedInfos, hashDocs);
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
        web3.eth.sendRawTransaction(raw, function (err, data) {
            if (!err)

                res.send(data);
            else
                res.send(err);
        });

    }
);


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

    }
);

router.get('/AllTransaction', function (req, res) {
    var web3 = new Web3(new Web3.providers.HttpProvider(constants.providerAddress));
    var DataPassContract = web3.eth.contract(constants.contractAbi);
    var dataPass = DataPassContract.at(constants.contractAddress);
    var Event = dataPass.LogReturn({}, {fromBlock: 0, toBlock: 'latest'});


    Event.get(function (err, logs) {
        if (!err) {
            var transactions = [];
            for (i = logs.length - 1; i > logs.length - 5; i--) {
                transactions.push({
                    "time": web3.eth.getBlock(logs[i].blockNumber).timestamp,
                    "blockHash": logs[i].transactionHash
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
    getLogsFromCache().then(function (LogResult) {
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


function getLogsFromCache() {
    return new Promise(function (resolve, reject) {
        request(cacheConfig.cacheServerAddress,
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
    Lands.findOne({'_id': id}, function (err, result) {
        if (err) {
            res.send(err);
        } else {

            if (result == null)
                res.status(404).send();


            else {
                var children = [];

                Lands.find({parent: result._id}, (err, result1) => {

                    if (result1) {
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