var express = require('express');
var router = express.Router();
var Category = require('../models/Category.js');
var Content = require('../models/Content.js');
var data;
//处理通用的数据
router.use(function(req,res,next){
	data = {
		userInfo:req.userInfo,
		categories:[]
	};
	Category.find().sort({_id:-1}).then(function(categories){
		data.categories = categories;
		next();
	})
})
//首页
router.get('/',function(req,res,next){
	data.category = req.query.category || '';
	data.page = Number(req.query.page) || 1;
	data.limit = 2;
	data.pages = 0;
	data.count = 0;
	var where = {};
	if(data.category){
		where.category = data.category;
	}
	//读取内容
	Content.where(where).count().then(function(count){
		data.count = count;
		//计算总页数向上取整
		data.pages = Math.ceil(data.count / data.limit);
		//page取值不能超过pages，去总页数和page中的最小值
		data.page = Math.min(data.page,data.pages);
		//page取值不能小于1
		data.page = Math.max(data.page,1);
		var skip = (data.page -1 ) * data.limit;

		//读取内容,最新的展示在最前面
		return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({
			addTime:-1
		});
	}).then(function(contents){
		data.contents = contents; //将内容赋值给data属性
		// console.log(data);
		res.render('main/index',data);
	})

})
router.get('/view',function(req,res){
	var contentid = req.query.contentid || '';
	Content.findOne({
		_id:contentid
	}).then(function(content){
		data.content = content;
		content.views ++ ; //阅读量增加
		content.save(); //保存阅读量
		res.render('main/view',data)
	})
})
module.exports = router;
