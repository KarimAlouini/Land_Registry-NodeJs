var express = require('express');
var router = express.Router();
var Lands = require('../models/Land.model');
var User = require('../models/User.model');
const request= require('request')
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
var crypto = require('crypto-js');

var abi =[
    {
        "constant": false,
        "inputs": [
            {
                "name": "_address",
                "type": "address"
            },
            {
                "name": "_idInDB",
                "type": "string"
            },
            {
                "name": "_hashedInfos",
                "type": "string"
            },
            {
                "name": "_hashDocs",
                "type": "string"
            }
        ],
        "name": "add",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_address",
                "type": "address"
            }
        ],
        "name": "addAgent",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "MyAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "idInDB",
                "type": "string"
            },
            {
                "indexed": false,
                "name": "hashedInfos",
                "type": "string"
            },
            {
                "indexed": false,
                "name": "hashDocs",
                "type": "string"
            }
        ],
        "name": "LogReturn",
        "type": "event"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_senderAddress",
                "type": "address"
            }
        ],
        "name": "accessCheck",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "agents",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            },
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "properties",
        "outputs": [
            {
                "name": "idInDB",
                "type": "string"
            },
            {
                "name": "hashedInfos",
                "type": "string"
            },
            {
                "name": "hashDocs",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

router.post('/addLand',function (req,res) {

        console.log('addLand');
        var address = String(req.body.address);
        var senderPrivateKey = String(req.body.privateKey);
        var idland = String(req.body.idland);
        var hashedInfos = String(req.body.hashedInfos);
        var hashDocs = String(req.body.hashDocs);

        var web3 = new Web3(new Web3.providers.HttpProvider('http://34.246.20.177:8545'));
        var DataPassContract = web3.eth.contract(abi);
        var dataPass = DataPassContract.at('0x3d7d89f3ef6ec7efb5bf5e5cb9065f98b0cbb27e');
        var privateKey = new Buffer(senderPrivateKey, 'hex');
        var contactFunction = dataPass.add.getData(String(address),idland,hashedInfos,hashDocs);
        var number = web3.eth.getTransactionCount(address,"pending");
        console.log(web3.version);
        var rawTx = {
            nonce: number, // nonce is numbre of transaction (done AND pending) by the account : function to get :  web3.eth.getTransactionCount(accountAddress) + pending transactions
            gasPrice: web3.toHex(web3.toWei('1000', 'gwei')),
            gasLimit: web3.toHex(3000000),
            from: address,
            to: '0x3d7d89f3ef6ec7efb5bf5e5cb9065f98b0cbb27e', // contract address
            value: '0x00',
            data: String(contactFunction)
        };

        var tx = new Tx(rawTx);
        tx.sign(privateKey);

        var serializedTx = tx.serialize();
        var raw = '0x' + serializedTx.toString('hex');
        web3.eth.sendRawTransaction(raw,function (err,data) {
            if(!err)

                res.send(data);
            else
                res.send(err);
        });

    }
);




router.get('/transactionStatus/:hash', function (req, res) {
    var hash = req.params.hash;
    var web3 = new Web3(new Web3.providers.HttpProvider('http://34.246.20.177:8545'));

    web3.eth.getTransactionReceipt(hash,function (err,data) {
        if(!err)
            res.send(data);
        else
            res.send(err);
    })
});

router.get('/accessCheck/:address',verifyToken,function (req,res) {
    var address=String(req.params.address);
    var web3 = new Web3(new Web3.providers.HttpProvider('http://34.246.20.177:8545'));
    var DataPassContract = web3.eth.contract(abi);
    var dataPass = DataPassContract.at('0x9826c4ba142c1e32d74405eba6b2eb3d65cd253b');
    jwt.verify(req.token,'quadraSecretKey',function (err,authData) {
        if(err){
            res.sendStatus(403);
        }else{
            dataPass.accessCheck.call(address,function(err, result) {
                if(err) {
                    res.send('a problem');
                } else {
                    res.json({"result":result,'authData':authData})
                }
            });
        }
    });

});
router.post('/addAgent',function (req,res) {

        var address=String(req.body.SenderAddress);
        var agentAddress=String(req.body.AgentAddress);
        var senderPrivateKey=String(req.body.privateKey);
        var web3 = new Web3(new Web3.providers.HttpProvider('http://34.246.20.177:8545'));
        var DataPassContract = web3.eth.contract(abi);
        var dataPass = DataPassContract.at('0x9826c4ba142c1e32d74405eba6b2eb3d65cd253b');
        var privateKey = new Buffer(senderPrivateKey, 'hex');
        var contactFunction = dataPass.addAgent.getData(agentAddress);
        var number = web3.eth.getTransactionCount(address,"pending");
        console.log(web3.version);
        var rawTx = {
            nonce: number, // nonce is numbre of transaction (done AND pending) by the account : function to get :  web3.eth.getTransactionCount(accountAddress) + pending transactions
            gasPrice: web3.toHex(web3.toWei('1000','gwei')),
            gasLimit: web3.toHex(3000000),
            from : address,
            to: '0x9826c4ba142c1e32d74405eba6b2eb3d65cd253b', // contract address
            value: '0x00',
            data: String(contactFunction)
        };

        var tx = new Tx(rawTx);
        tx.sign(privateKey);

        var serializedTx = tx.serialize();
        var raw = '0x' + serializedTx.toString('hex');
        web3.eth.sendRawTransaction(raw,function (err,data) {
            if(!err)

                res.send(data);
            else
                res.send(err);
        });

    }
);

router.get('/AllTransaction',function (req,res) {
    var web3 = new Web3(new Web3.providers.HttpProvider('http://34.246.20.177:8545'));
    var DataPassContract = web3.eth.contract(abi);
    var dataPass = DataPassContract.at('0x9826c4ba142c1e32d74405eba6b2eb3d65cd253b');
    var Event = dataPass.LogReturn({}, {fromBlock: 90, toBlock: 'latest'});


    Event.get(function (err,logs) {
        if(!err){
            var transactions=[];
            for (i = logs.length-5; i < logs.length; i++) {
                transactions.push( new Date(Date.now()-(web3.eth.getBlock(2955825).timestamp)));
            };
            res.json(transactions);
        }
        else {
            throw  err
        }
    });
});
router.get('/GetLandsFromCache',function (req,res) {
    getLogsFromCache().then(function(LogResult){
        var convertedLands=[];
        Lands.find({},function (err,DBResult) {
            if(err){
                res.send(err);
            }
            else{
                LogResult.forEach(function (object) {
                var x   =   DBResult.find(function (element) {
                      return  element._id==object.id;
                   });
                if(x != undefined)
                convertedLands.push(x);
                });
                res.json(convertedLands);
            }});
    }).catch(function(error){
        res.send(error);
    })
});

function getLogsFromCache(){
    return new Promise(function(resolve,reject){
        request('http://54.76.154.101:3000',
            function (error,response,body) {
                if(error)
                {
                    reject(" problem ");
                }
                else {
                    resolve(JSON.parse(body));
                }
            })
    })
}


router.post('/add', (req, res) => {
    console.log("hiii");


    var land;
    try {
        land = JSON.parse(req.body.land);
    } catch (e) {
        res.status(500).send();
    }

    var pinsHash = sha256(JSON.stringify(land.pins));

    Lands.find({
        owner: land.owner,

    }, function (err, result) {
        if (err)
            res.status(500).send(err);
        else {

            var notExists = result.every((element) => {
                var myPins = sha256(JSON.stringify(utils.pickFromArray(element.pins, 'longitude', 'latitude')));


                /*if (myPins === pinsHash) {
                    exists = true;
                    console.log('exists true');
                    res.status(201).json({
                        code: 1,
                        message: 'Land already exists'
                    });


                }*/

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


            });


            console.log("exist");

            if (notExists) {

                if (!req.files.documents) {
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


                    if (isNaN(req.files.documents.length)) {
                        console.log('single file');
                        files.push(req.files.documents);
                        //if it's single file
                        req.files.documents.mv(path.join(landPath, req.files.documents.name), (err) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send();

                            }
                            else {
                                files.push(req.files.documents);
                            }


                        });
                    }
                    else {
                        console.log('too many files');
                        files = req.files.documents;
                        //if it's an array
                        async.forEachOf(req.files.documents, (element) => {

                            element.mv(path.join(landPath, element.name), (err) => {
                                if (err) {


                                    res.status(500).send();

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
                                hashes +=chunks;
                                l.documents.push({
                                    name:file.name,
                                    hash:sha256(chunks)

                                })
                            })
                    });




                    l.save((err, data) => {
                        if (err)
                            res.status(500).send();
                        console.log('added to database');
                        res.json(data);
                    })
                }


            }

        }

    });

});
router.post('/generatToken',function (req,res) {
    jwt.sign(req.body,'quadraSecretKey',{expiresIn:'1h'},function (err,token) {
        if(!err)
            res.json({'token':token});
    })
});

function verifyToken(req,res,next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof  bearerHeader !== 'undefined')
    {
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        req.token = token;
        next();
    }else {
        res.sendStatus(403);
    }



}
router.get('/users/:address',function (req,res) {
    var address = req.params.address;
    User.find({'blockchainAddress' : address},function (err,result) {
        if(err){
            res.send(err);
        }
        if(result){
            res.json(result);
        }

        });
});
router.get('/getLandByID/:id',function (req,res) {
    var id = req.params.id;
    Lands.find({'_id' : id },function (err,result) {
        if (err){
            res.send(err);
        }else{
            res.json(result[0]);
        }

    })

});








module.exports = router;