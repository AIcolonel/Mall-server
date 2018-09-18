const mongoose = require('mongoose');
const paging = require('../util/paging.js');

// 生成一个Schema模型
const GoodsSchema = new mongoose.Schema({
  	name:{//商品名称
      type:String
    },
    describe:{//商品描述
    	type:String
    },
    sonId:{//商品所属分类id
      type:mongoose.Schema.Types.ObjectId,
      ref:'Category'
    },
    price:{//商品价格
      type:Number
    },
    number:{//商品库存
      type:Number
    },
    image:{//商品图片
      type:String
    },
    order:{
      type:Number,
      default:0
    },
    value:{//商品详情页
      type:String
    },
    status:{//商品是否上架
      type:String,
      default:'0'//0-上架，1-下架
    }
},{
  timestamps:true
});


GoodsSchema.statics.findPagingGoods=function(req,query={},field='_id name sonId status',sort={_id:-1}){
    return new Promise((resolve,reject)=>{
        // 在数据库中查找评论的信息
        let options={
            page:req.query.page || 1,//页码
            model:this,//数据库模板
            query:query,//条件
            field:field,//字段
            sort:sort//排序
        }
        paging(options)
        .then((data)=>{
            resolve(data)
        })
    })
    
}

// 利用Schema生成model
const Goods = mongoose.model('Goods', GoodsSchema);

module.exports=Goods;