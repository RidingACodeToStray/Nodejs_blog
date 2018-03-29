var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	//将第二个参数用户的cookies传给html使用
	res.render('main/index.html',{
		userInfo:req.userInfo
	});
})

module.exports = router;
