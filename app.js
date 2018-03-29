var express = require('express'); //加载express模块
var swig = require('swig'); //加载模板处理模块
var mongoose = require('mongoose'); //加载数据库模块
var bodyParser = require('body-parser');//加载body-parser处理post提交的数据
var Cookies = require('cookies'); ;//加载cookies模块
//配置模板引擎
var app = express(); //创建app应用,相当于nodeJS的http.createService()

var User = require('./models/User');
app.engine('html',swig.renderFile); //定义当前模板引擎，第一个参数：模板引擎名称，也是模板文件后缀；第二个参数：处理模板的方法
app.set('views','./views'); //设置模板文件存放的目录,第一个参数必须是views，第二个参数是目录
app.set('view engine','html'); //注册模板
swig.setDefaults({cache:false});//取消模板缓存
app.use('/public',express.static(__dirname + '/public'));//当用户请求的路径ulr以/public开头时，以第二个参数的方式进行处理（直接返回__dirname + '/public'目录下文件）

app.use(bodyParser.urlencoded({extended:true}));//bodyparser设置

//设置cookie
app.use(function(req,res,next){
	req.cookies = new Cookies(req,res); //调用req的cookies方法把Cookies加载到req对象里面
	req.userInfo = {}; //定义一个全局访问对象
	//如果浏览器请求有cookie信息,尝试解析cookie
	if(req.cookies.get('userInfo')){
		try{
			req.userInfo = JSON.parse(req.cookies.get('userInfo'));
			//获取当前用户登录的类型，是否是管理员
			User.findById(req.userInfo._id).then(function(userInfo){
				req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
				next();
			})
		}catch(e){
			next();
		}
	}else{
		next();
	}
})
//根据不同的功能划分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

mongoose.connect('mongodb://localhost:27017/blog',function(err){
	if(err){
		console.log("数据库连接失败");
	}else{
		console.log("数据库连接成功");
		app.listen(8081); //监听http请求
	}
});
