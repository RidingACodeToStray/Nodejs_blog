var express = require('express');
var router = express.Router();

router.get('/user',function(req,res,next){
	res.send('admin-User');
})

module.exports = router;
 