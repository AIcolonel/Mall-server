const express = require('express');
const router = express.Router();
const path = require('path');
const Mall = require('../models/mall.js');
const OrderModel = require('../models/order.js');
const paging=require('../util/paging.js');

//权限验证  
router.use((req,res,next)=>{
    if(req.userInfo.id){
        next();
    }else{
        res.json({
            code:10
        });
    }

})

//获取商品列表信息
router.get('/',(req,res)=>{
    Mall.findById(req.userInfo.id)
    .then(user=>{
        user.getOrderList()
        .then(order=>{
            res.json({
                code:0,
                data:order
            })          
        })
    })
    .catch(e=>{
        console.log(e);
         res.json({
            code:1,
            message:'获取商品列表信息失败'
        })
    })
})

//创建订单
router.post('/',(req,res)=>{
    Mall.findById(req.userInfo.id)
    .then(user=>{
        let order = {};
        user.getOrderList()
        .then((result)=>{
            order.payment = result.totalCartPrice;
            //构建订单的商品
            let productList = [];
            result.cartList.forEach(item=>{
                productList.push({
                    productId:item.product._id,
                    count:item.count,
                    totalPrice:item.totalPrice,
                    price:item.product.price,
                    filepath:item.product.filepath,
                    name:item.product.name
                })
            })
            order.productList = productList;

            //构建订单的的地址信息
            let shipping = user.shipping.id(req.body.shippingId)
            order.shipping = {
                shippingId:shipping._id,
                username:shipping.username,
                province:shipping.province,
                city:shipping.city,
                address:shipping.address,
                userphone:shipping.userphone,
                zip:shipping.zip
            }

            //构建订单号
            order.orderNo =Date.now().toString() + parseInt(Math.random()*10000)
            
            //赋值用户ID
            order.user = user._id

            new OrderModel(order)
            .save()
            .then((newOrder)=>{ 
                //通过遍历数组中checked属性找到选中的购物车信息，然后用filter将其筛选出数组，生成的新数组中没有该条商品信息
                Mall.findById(req.userInfo.id)
                .then(userUser=>{
                   let newCartList=userUser.cart.cartList.filter(item=>{
                        return item.checked == false;
                    })
                    userUser.cart.cartList=newCartList;

                    userUser.save()
                    .then((newCart)=>{
                        res.json({
                            code:0,
                            data:newOrder
                        })
                    }) 
                })
                
                
            })
        })
        
    })
    .catch(e=>{
        console.log(e);
        res.json({
            code:1,
            message:'后台:生成订单错误'
        })
    })
})

//获取订单信息
router.get('/list',(req,res)=>{
    let page=req.query.page;

    OrderModel.findPagingOrders(req)
    .then((docs)=>{
        res.json({
            code:0,
            data:{
                current:docs.current,//当前页码
                list:docs.list,//当前页的内容
                total:docs.total,//总页数
                pageSize:docs.pageSize//每页显示的条数
            }
        })
    })
    .catch((e)=>{
        console.log(e);
        res.json({
            code:1,
            message:'后台：获取订单信息失败'
        })
    })
})


//获取订单详情信息
router.get('/detail',(req,res)=>{
    let orderNo=req.query.orderNo;
    OrderModel.findOne({orderNo:orderNo,user:req.userInfo.id})
    .then(order=>{
        res.json({
            code:0,
            data:order
        })  
    })
    .catch(e=>{
        console.log(e);
         res.json({
            code:1,
            message:'获取商品列表信息失败'
        })
    })
})

//取消订单
router.put('/cancel',(req,res)=>{
    let orderNo=req.body.orderNo;
    OrderModel.findOneAndUpdate(
        {orderNo:orderNo,user:req.userInfo.id},//查询条件
        {status:20,statusDesc:"取消"},//需要更新的内容
        {new:true}//true:返回更新后的数据,false:返回未更新前的数据
        )
    .then(order=>{
        res.json({
            code:0,
            data:order
        })  
    })
    .catch(e=>{
        console.log(e);
         res.json({
            code:1,
            message:'后台：取消订单失败'
        })
    })
})


//后台:获取订单列表信息
router.get('/backList',(req,res)=>{
    // console.log(req.query);
    if(req.query.page){
        let options={
            page:req.query.page,//页码
            model:OrderModel,//数据库模板
            query:{},//条件
            field:'-__v',//字段
            sort:{_id:1},//排序
        }
        paging(options)
        .then((result)=>{
            res.json({
                code:0,
                data:{
                    current:result.current,//当前页码
                    list:result.list,//当前页的内容
                    total:result.total,//总页数
                    pageSize:result.pageSize//每页显示的条数
                }
            });
        })
    }else{
        OrderModel.find()
        .then((order)=>{
            res.json({
                code:0,
                data:order
            });
        })
        .catch(e=>{
            res.json({
                code:1,
                message:'后台：获取用户订单信息失败，服务器端异常'
            })
        })
    }
})

//后台：处理搜索订单路由
router.get('/searchOrder',(req,res)=>{
    console.log(req.query);
    let page=req.query.page || 1;
    let keyword=req.query.keyword;
    let options={
            page:page,//页码
            model:OrderModel,//数据库模板
            query:{orderNo:{$regex:new RegExp(keyword,'i')}},//条件
            field:'-__v',//字段
            sort:{_id:1},//排序
        }
        paging(options)
        .then((result)=>{
            res.json({
                code:0,
                data:{
                    keyword:keyword,
                    current:result.current,//当前页码
                    list:result.list,//当前页的内容
                    total:result.total,//总页数
                    pageSize:result.pageSize//每页显示的条数
                }
            });
        })
        .catch(e=>{
            res.json({
                code:1,
                message:'后台：搜索订单失败，服务器端异常'
            })
        })
})

//后台：查看订单详情
router.get('/backDetail',(req,res)=>{
    // console.log(req.query);
    const orderNo=req.query.orderNo;
    OrderModel.findOne({orderNo:orderNo})
    .then((order)=>{
        res.json({
            code:0,
            data:order 
        });
    })
    .catch(e=>{
        res.json({
            code:1,
            message:'后台：查看订单详情信息失败，服务器端异常'
        })
    })
})

module.exports=router;