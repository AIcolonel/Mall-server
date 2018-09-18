const express = require('express');
const router = express.Router();
const path = require('path');
const Mall = require('../models/mall.js');
const OrderModel = require('../models/order.js');

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

//订单支付
router.get('/',(req,res)=>{
    let orderNo=req.query.orderNo;
    res.json({
        code:0,
        data:{
            orderNo:orderNo,
            paymentUrl:'http://127.0.0.1:3000/upload-image/payment.jpg'
        }
    })
})

//监听用户支付状态
router.get('/getStatus',(req,res)=>{
    let orderNo=req.query.orderNo;
    OrderModel.findOne({orderNo:orderNo},"status")
    .then(order=>{
        res.json({
            code:0,
            data:order.status==30
        })
    })
    
})



module.exports=router;