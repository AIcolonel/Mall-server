const express = require('express');
const router = express.Router();
const path = require('path');
const Mall = require('../models/mall.js');
  
router.use((req,res,next)=>{
	if(req.userInfo.id){
		next();
	}else{
		res.json({
            code:10
        });
	}
})

//获取添加地址信息
router.post('/',(req,res)=>{
	// console.log(req.body);
	let body=req.body;
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        //如果有地址
        if(user.shipping){
            user.shipping.push({
            	username:body.username,
            	province:body.province,
            	city:body.city,
            	address:body.address,
            	userphone:body.userphone,
            	zip:body.zip
            })
        }else{
            //没有地址
            user.shipping=[body]
        }

        user.save()
        .then((newCart)=>{
           res.json({
	            code:0,
	            data:user.shipping
	        }) 
        })
    })
    .catch(e=>{
        console.log(e);
         res.json({
            code:1,
            message:'获取地址失败'
        })
    })
})


//获取地址信息
router.get('/list',(req,res)=>{
    // console.log(req.body);
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        res.json({
            code:0,
            data:user.shipping
        }) 
    })
    .catch(e=>{
        console.log(e);
         res.json({
            code:1,
            message:'获取地址信息失败'
        })
    })
})

//删除地址信息
router.put('/deleteAddress',(req,res)=>{
    // console.log(req.body);
    let body=req.body;
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        user.shipping.id(body.shippingId).remove();
        user.save()
        .then((newCart)=>{
           res.json({
                code:0,
                data:user.shipping
            }) 
        })
    })
    .catch(e=>{
        console.log(e);
         res.json({
            code:1,
            message:'删除地址失败'
        })
    })
})

//获取编辑的该条地址信息
router.get('/getAddress',(req,res)=>{
    // console.log(req.body);
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        res.json({
            code:0,
            data:user.shipping.id(req.query.shippingId)
        }) 
    })
    .catch(e=>{
        console.log(e);
         res.json({
            code:1,
            message:'获取编辑地址信息失败'
        })
    })
})

//编辑地址
router.put('/editAddress',(req,res)=>{
    // console.log(req.body);
    let body=req.body;
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        let shipping = user.shipping.id(req.body.shippingId);
        shipping.username= body.username;
        shipping.province= body.province;
        shipping.city= body.city;
        shipping.address= body.address;
        shipping.userphone= body.userphone;
        shipping.zip= body.zip;

        user.save()
        .then(newUser=>{
            res.json({
                code:0,
                data:user.shipping
            })
        })
    })
    .catch(e=>{
        console.log(e);
         res.json({
            code:1,
            message:'获取地址信息失败'
        })
    })
})

module.exports=router;