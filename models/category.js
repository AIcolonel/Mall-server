const mongoose = require('mongoose');

// 生成一个Schema模型
const CategorySchema = new mongoose.Schema({
  	name:{
      type:String
    },
    pid:{
    	type:String
    },
    order:{
      type:Number,
      default:0
    }
},{
  timestamps:true
});

// 利用Schema生成model
const Category = mongoose.model('Category', CategorySchema);

module.exports=Category;