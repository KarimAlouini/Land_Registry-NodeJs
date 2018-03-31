var express = require('express');
var router = express.Router();
var Lands = require('../models/Land.model');
const request= require('request')
var Web3 = require('web3');
var bodyParser = require('body-parser');
var privateKey = new Buffer('922bd7a49e2496bf1c3c9b27e71eb1439988f80bf5854034be3d0eabd753660b', 'hex');
const Tx = require('ethereumjs-tx');
var app = express();
app.use(bodyParser.json());

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

        var address=String(req.body.address);
        var senderPrivateKey=String(req.body.privateKey);
        var idland=String(req.body.idland);
        var hashedInfos=String(req.body.hashedInfos);
        var hashDocs=String(req.body.hashDocs);

        var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/1RDCTkvhEAhjoZbvi73o'));
        var DataPassContract = web3.eth.contract(abi);
        var dataPass = DataPassContract.at('0x9826c4ba142c1e32d74405eba6b2eb3d65cd253b');
        var privateKey = new Buffer(senderPrivateKey, 'hex');
        var contactFunction = dataPass.add.getData(String(address),idland,hashedInfos,hashDocs);
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

router.get('/transactionStatus/:hash',function (req,res) {
    var hash=req.params.hash;
    var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/'));

    web3.eth.getTransactionReceipt(hash,function (err,data) {
        if(!err)
            res.send(data);
        else
            res.send(err);
    })
});

router.get('/accessCheck/:address',function (req,res) {
    var address=String(req.params.address);
    var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/'));
    var DataPassContract = web3.eth.contract(abi);
    var dataPass = DataPassContract.at('0x9826c4ba142c1e32d74405eba6b2eb3d65cd253b');
    dataPass.accessCheck.call(address,function(err, result) {
        if(err) {
            res.send('f');
        } else {
            res.send(result);
        }
    });


});
router.post('/addAgent/:address/:privateKey',function (req,res) {

        var address=String(req.params.address);
        var agentAddress=String(req.body.address);
        var senderPrivateKey=String(req.params.privateKey);
        var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/1RDCTkvhEAhjoZbvi73o'));
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
router.get('/GetLandsFromCache',function (req,res) {
   /* request.get('http://54.76.154.101',
        function (error,response,body) {
            if(error)
            {
                throw error;
            }
            else {
                res.json(JSON.parse(body));
            }
        })

    Lands.find({},function (err,result) {
        if(err){
            res.send(err);
        }
        if(!result){
            res.status(404).send();

        }else{
            res.json(result);
        }});
*/
    getLogsFromCache().then(function(result){
        res.json(result);
    }).catch(function(error){
        res.send(error);
    })
});

function getLogsFromCache(){
    return new Promise(function(resolve,reject){
        request('http://54.76.154.101',
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
module.exports=router;