var express = require('express');
var router = express.Router();
var User = require('../models/User.js');
var Category = require('../models/Category.js');
var Content = require('../models/Content.js');
router.use(function(req,res,next){
	if(!req.userInfo.isAdmin){
		res.send('对不起，只有管理员才可以进入后台管理');
	}
	next();
})
//首页
router.get('/',function(req,res,next){
	res.render('admin/index',{
		userInfo:req.userInfo
	});
})
//用户管理

router.get('/user',function(req,res){
	//limit()限制获取的用户条数
	//skip()忽略数据的查询
	var page = Number(req.query.page) || 1;
	var limit = 2;
	var pages = 0;
	User.count().then(function(count){
		//计算总页数向上取整
		pages = Math.ceil(count / limit);
		//page取值不能超过pages，去总页数和page中的最小值
		page = Math.min(page,pages);
		//page取值不能小于1
		page = Math.max(page,1);
		var skip = (page -1 ) * limit;
		//从数据中读取所有的用户数据
		User.find().limit(limit).skip(skip).then(function(users){
			// console.log(users);
			res.render('admin/user_index',{
				userInfo:req.userInfo,
				users:users,
				page:page,
				count:count,
				pages:pages,
				limit:limit
			});
		});	
	})
})
//分类展示
router.get('/category',function(req,res){
	//limit()限制获取的用户条数
	//skip()忽略数据的查询
	var page = Number(req.query.page) || 1;
	var limit = 2;
	var pages = 0;
	Category.count().then(function(count){
		//计算总页数向上取整
		pages = Math.ceil(count / limit);
		//page取值不能超过pages，去总页数和page中的最小值
		page = Math.min(page,pages);
		//page取值不能小于1
		page = Math.max(page,1);
		var skip = (page -1 ) * limit;
		//从数据中读取所有的用户数据
		//sort排序1表示升序-1表示降序
		Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
			// console.log(users);
			res.render('admin/category_index',{
				userInfo:req.userInfo,
				categories:categories,
				page:page,
				count:count,
				pages:pages,
				limit:limit
			});
		});	
	})
})
//分类添加
router.get('/category/add',function(req,res){
	res.render('admin/category_add',{
		userInfo:req.userInfo
	})
})
//分类的保存
router.post('/category/add',function(req,res){
	var name = req.body.name || '';
	if(name == ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:"名称不能为空"
		});
		return;
	}
	//数据库中是否已经存在同名名称
	Category.findOne({
		name:name
	}).then(function(res){
		if(res){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类已经存在'
			})
			return Promise.reject(); //不在执行then方法
		}else{
			//若数据库中不存在该分类
			return new Category({
				name:name
			}).save();
		}
	}).then(function(rs){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'分类保存成功',
			url:'/admin/category'
		})
	})
})
//分类修改
router.get('/category/edit',function(req,res){
	//获取要修改分类的信息，用表单展示出来
	var id = req.query.id || '';
	//获取要修改的分类信息
	Category.findOne({
		_id:id
	}).then(function(category){
		// console.log(category);
		if(!category){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在'
			})
		}else{
				res.render('admin/category_edit',{
					userInfo:req.userInfo,
					category:category
				});
			}
	})
})
//分类修改保存
router.post('/category/edit',function(req,res){
	var id = req.query.id || '';
	//获取新的分类名称
	var name = req.body.name || '';
	Category.findOne({
		_id:id
	}).then(function(category){
		if(!category){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在'
			})
			return Promise.reject();
		}else{
			//当用户没有做任何修改
			if(name == category.name){
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'修改成功',
					url:'/admin/category'
				});
				return Promise.reject();
			}else{
				//修改名称是否已经存在
				return Category.findOne({
					_id:{$ne: id},
					name:name
				})
			}
		}
	}).then(function(sameCategory){
		if(sameCategory){
			res.render('admin/error',{
					userInfo:req.userInfo,
					message:'数据库中已经存在同名分类'
				});
			return Promise.reject();
		}else{
			return Category.update({
				_id:id,
			},{
				name:name
			})
		}
	}).then(function(){
		res.render('admin/success',{
					userInfo:req.userInfo,
					message:'修改成功',
					url:'/admin/category'
				});
	})

})
//分类删除
router.get('/category/delete',function(req,res){
	var id = req.query.id || '';
	Category.remove({
		_id:id
	}).then(function(){
		res.render('admin/success',{
					userInfo:req.userInfo,
					message:'删除成功',
					url:'/admin/category'
				});
	})
})

//内容首页
router.get('/content',function(req,res){
	//limit()限制获取的用户条数
	//skip()忽略数据的查询
	var page = Number(req.query.page) || 1;
	var limit = 10;
	var pages = 0;
	Content.count().then(function(count){
		//计算总页数向上取整
		pages = Math.ceil(count / limit);
		//page取值不能超过pages，去总页数和page中的最小值
		page = Math.min(page,pages);
		//page取值不能小于1
		page = Math.max(page,1);
		var skip = (page -1 ) * limit;
		//从数据中读取所有的用户数据
		//sort排序1表示升序-1表示降序
		//populate关联category的信息
		Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function(contents){
			// console.log(contents);
			res.render('admin/content_index',{
				userInfo:req.userInfo,
				contents:contents,
				page:page,
				count:count,
				pages:pages,
				limit:limit
			});
		});	
	})
})
//内容添加
router.get('/content/add',function(req,res){
	Category.find().sort({_id:-1}).then(function(categories){
		res.render('admin/content_add',{
			userInfo:req.userInfo,
			categories:categories
		})
	})
	
})
//内容保存
router.post('/content/add',function(req,res){
	// console.log(req.body);
	// 验证
	if (req.body.title == '') {
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'标题不能为空'
		})
		return;
	}
	if (req.body.content == '') {
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'内容不能为空'
		})
		return;
	}
	//保存
	new Content({
		category:req.body.category,
		title:req.body.title,
		user:req.userInfo._id.toString(),
		desciption:req.body.desciption,
		content:req.body.content
	}).save().then(function(){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'内容保存成功',
			url:'/admin/content'
		})
		return;
	})
})
//内容修改
router.get('/content/edit',function(req,res){
	var id = req.query.id || '';
	var categories = [];
	Category.find().sort({_id:1}).then(function(res){
		categories = res;
		return Content.findOne({
			_id:id
		}).populate('category');
	}).then(function(content){
			if(!content){
				res.render('admin/error',{
					userInfo:userInfo,
					message:'指定内容不存在'
				});
				return Promise.reject();
			} else{
				res.render('admin/content_edit',{
					userInfo:req.userInfo,
					categories:categories,
					content:content
				})
			}
		})

	
});
//内容修改保存
router.post('/content/edit',function(req,res){
	var id = req.query.id || '';
	if (req.body.title == '') {
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'标题不能为空'
		})
		return;
	}
	if (req.body.content == '') {
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'内容不能为空'
		})
		return;
	}
	Content.update({
		_id:id
	},{
		category:req.body.category,
		title:req.body.title,
		desciption:req.body.desciption,
		content:req.body.content
	}).then(function(){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'内容保存成功',
			url: '/admin/content/edit?id=' + id
		})
	})

})
//内容删除
router.get('/content/delete',function(req,res){
	var id = req.query.id || '';
	Content.remove({
		_id:id
	}).then(function(){
		res.render('admin/success',{
					userInfo:req.userInfo,
					message:'删除成功',
					url:'/admin/content'
				});
	})
})
module.exports = router;
 