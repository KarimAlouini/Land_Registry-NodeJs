var express = require('express');
var router = express.Router();
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
                "name": "_a",
                "type": "uint256"
            }
        ],
        "name": "justTest",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
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
    },
    {
        "constant": true,
        "inputs": [],
        "name": "tt",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

router.get('/:address/:privateKey',function (req,res) {

        var address=String(req.params.address);
        var senderPrivateKey=String(req.params.privateKey);
        var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/1RDCTkvhEAhjoZbvi73o'));
        var DataPassContract = web3.eth.contract(abi);
        var dataPass = DataPassContract.at('0x882c86afeda425d319e6ad7f5316b68155dd5626');
        var privateKey = new Buffer(senderPrivateKey, 'hex');
        var contactFunction = dataPass.add.getData(String(address),'2','ben','rouha');
        var number = web3.eth.getTransactionCount(address,"pending");
        console.log(web3.version);
        var rawTx = {
            nonce: number, // nonce is numbre of transaction (done AND pending) by the account : function to get :  web3.eth.getTransactionCount(accountAddress) + pending transactions
            gasPrice: web3.toHex(web3.toWei('1000','gwei')),
            gasLimit: web3.toHex(3000000),
            from : address,
            to: '0x882c86afeda425d319e6ad7f5316b68155dd5626', // contract address
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


module.exports=router;