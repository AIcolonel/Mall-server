const mongoose = require('mongoose');
const paging=require('../util/paging.js');

const ProductSchema = new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Goods'
    },
    price:{
    	type:Number
    },
    name:{
    	type:String
    },
    filePath:{
    	type:String
    },
    count:{
        type:Number,
        default:1
    },
    totalPrice:{
        type:Number,
        default:0
    },
})

const ShippingSchema = new mongoose.Schema({
	shippingId:{
		type:String
	},
    username:{
        type:String
    },
    province:{
        type:String
    },
    city:{
        type:String
    },
    address:{
        type:String
    },
    userphone:{
        type:String
    },
    zip:{
        type:String
    },
})

const OrderSchema = new mongoose.Schema({
	//订单所属用户
	user:{
		type:mongoose.Schema.Types.ObjectId,
   		ref:'Mall'
	},
	//订单号
	orderNo:{
		type:String
	},
	//支付金额
	payment:{
		type:String
	},
	//支付方法
	paymentType:{
		type:String,
		enum:["10","20"],//10-支付宝，20-微信
		default:"10"
	},
	paymentTypeDesc:{
		type:String,
		enum:["支付宝","微信"],//10-支付宝，20-微信
		default:"支付宝"
	},
	paymentTime:{
		type:Date
	},
	status:{
		type:String,
		enum:["10","20","30","40","50"],//10-未支付，20-取消，30-已支付，40-已发货，50-完成
		default:"10"
	},
	statusDesc:{
		type:String,
		enum:["未支付","取消","已支付","已发货","完成"],
		default:"未支付"
	},
	//配送信息
	shipping:{
		type:ShippingSchema,
	},
	//商品信息
	productList:{
		type:[ProductSchema],
		default:[]
	},
},{timestamps:true});

//获取订单分页
OrderSchema.statics.findPagingOrders=function(req,query={}){
    return new Promise((resolve,reject)=>{
        // 在数据库中查找评论的信息
        let options={
            page:req.query.page || 1,//页码
            model:this,//数据库模板
            query:query,//条件
            field:'-__v',//字段
            sort:{_id:-1}//排序
        }
        paging(options)
        .then((data)=>{
            resolve(data)
        })
    })
    
}

let OrderModel = mongoose.model('Order', OrderSchema);
module.exports=OrderModel;