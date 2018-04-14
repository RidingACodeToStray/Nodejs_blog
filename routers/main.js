var express = require('express');
var router = express.Router();
var Category = require('../models/Category.js');
router.get('/',function(req,res,next){
	//读取所有的分类信息
	Category.find().sort({_id:-1}).then(function(categories){
		// console.log(res);
		res.render('main/index.html',{
			userInfo:req.userInfo,
			categories:categories
		});
		
	});

})

module.exports = router;
