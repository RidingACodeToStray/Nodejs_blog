//创建一个Category的模型类
//实际操作的是操作通过操作模型类来对数据库操作（类似于tp里面的模型）
var mongoose = require('mongoose');
var ContentSchema = require('../schemas/content.js');

module.exports = mongoose.model('Content',ContentSchema)