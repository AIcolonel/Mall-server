const mongoose = require('mongoose');
const paging=require('../util/paging.js');

// 生成一个Schema模型
const ArticleSchema = new mongoose.Schema({
  	category:{
      	type:mongoose.Schema.Types.ObjectId,
      	ref:'Category'
    },
    author:{
    	type:mongoose.Schema.Types.ObjectId,
    	ref:'Blog'
    },
    title:{
    	type:String
    },
    intro:{
    	type:String
    },
    content:{
      	type:String
    },
    click:{
    	type:Number,
    	default:0
    },
    createAt:{
    	type:Date,
    	default:Date.now
    }
});

ArticleSchema.statics.findPagingArticles=function(req,query={}){
    return new Promise((resolve,reject)=>{
        // 在数据库中查找文章的信息
        let options={
            page:req.query.page,//页码
            model:this,//数据库模板
            query:query,//条件
            field:'-__v',//字段
            sort:{_id:-1},//排序
            populate:[{path:'category',select:'name'},{path:'author',select:'username'}]
        }
        paging(options)
        .then((data)=>{
            resolve(data)
        })
    })
    
}

// 利用Schema生成model
const Article = mongoose.model('Article', ArticleSchema);

module.exports=Article;