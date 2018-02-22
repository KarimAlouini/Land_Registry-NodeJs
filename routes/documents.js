var express = require('express');
var router = express.Router();




router.post('/add',function (req,res) {
    console.log(req.body.name);
    res.send('hi');
});
 

router.get('/url',function (req,res) {
    
})

module.exports = router;
