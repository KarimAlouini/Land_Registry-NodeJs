var express = require('express');
var router = express.Router();
var Demande = require('../models/Demande.model');
var Land = require('../models/Land.model');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

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

router.post('/demandeToBuy',(req,res)=>{
    var land_id=req.body.land;
    console.log('here');
    Land.findOne({_id:land_id},(error,data)=>{
        console.log(error);
        console.log(data == null);
        let d = new Demande({
            buyer : "5aa1b604fe137984720e98dc",
            seller:data.owner,
            land:data._id
        });
        d.save((err,rst)=>{
           if (err){

           }
           else{
               res.json(rst);
           }
        });
    });

});
router.get('/listMyDemande/:user',(req,res)=>{
    Demande.find({seller:req.params.user},(error,result)=>{
        res.json(result)
    })
});
router.get('/listAllDemande',(req,res)=>{
    Demande.find({},(error,result)=>{
        res.json(result)
    })
});

router.post('/acceptDemandeS/:id',(req,res)=>{
    Demande.update({_id:req.params.id},{$set:{"confirmBySeller.status":true,"confirmBySeller.day":Date.now()}},(error,data)=>{
       res.send(data);
    });
});

router.post('/acceptDemandeA/:id',(req,res)=>{
    Demande.findOneAndUpdate({_id:req.params.id},{$set:{"confirmByAgent.status":true,"confirmByAgent.day":Date.now()}},{new:true},(error,data)=>{
       Land.findOneAndUpdate({_id:data.land},{owner:data.buyer,isForSale:false},{new:true},(error,rest)=>{

        res.send(rest);
       });
    });
});

module.exports = router;