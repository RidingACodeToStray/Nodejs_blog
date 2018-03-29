//创建一个User的模型类
//实际操作的是操作通过操作模型类来对数据库操作（类似于tp里面的模型）
var mongoose = require('mongoose');
var usersSchema = require('../schemas/users');

//mongoose的模型方法创建User模型,操作usersSchema，并暴露出去
module.exports = mongoose.model('User',usersSchema)