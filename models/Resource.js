const mongoose = require('mongoose');
const paging=require('../util/paging.js');

// 生成一个Schema模型
const ResourceSchema = new mongoose.Schema({
    name:{
    	type:String
    },
    path:{ 
    	type:String
    }
});

ResourceSchema.statics.findPagingResources=function(req,query={}){
    return new Promise((resolve,reject)=>{
        // 在数据库中查找评论的信息
        let options={
            page:req.query.page,//页码
            model:this,//数据库模板
            query:query,//条件
            field:'-__v',//字段
            sort:{_id:-1},//排序
            populate:[{path:'article',select:'title'},{path:'user',select:'username'}]
        }
        paging(options)
        .then((data)=>{
            resolve(data)
        })
    })
}
// 利用Schema生成model
const Resource = mongoose.model('Resource', ResourceSchema);

module.exports=Resource;