const express = require('express');
const router = express.Router();
const Mall=require('../models/mall.js');
const Goods=require('../models/goods.js');
const hmac=require('../util/hmac.js');


// 用户注册
router.post('/register',(req,res)=>{
	console.log(req.body);
	Mall
	.findOne({username:req.body.username})
	.then((data)=>{
		let result={
			code:0,//成功
			message:'注册成功'
		}

		if(data){
			result.code=1;//返回失败
			result.message='注册失败,用户已存在';
			res.json(result);
		}else{
			Mall.insertMany({
				username:req.body.username,
				password:hmac(req.body.password),
				repassword:hmac(req.body.repassword),
				phone:req.body.phone,
				email:req.body.email
			},(err,data)=>{
				if(err){
					console.log(err);
				}else{
					res.json(result)
				}
			})
		}
	})
})
 
// 用户登录
router.post('/login',(req,res)=>{
	console.log(req.body);
	Mall
	.findOne({username:req.body.username,password:hmac(req.body.password),isAdmin:false})
	.then((data)=>{
		let result={
			code:0,//成功
			message:'登录成功'
		}

		if(data){
			req.session.userInfo={
				id:data._id,
				username:data.username,
				isAdmin:data.isAdmin
			}
			result.data=data;
			res.json(result);
		}else{
			result.code=1;
			result.message='用户名和密码错误'
			res.json(result);
		}
	})
})

//获取用户信息
router.get('/getUserName',(req,res)=>{
	if(req.userInfo.id){
		res.json({
			code:0,
			data:req.userInfo
		})
	}else{
		res.json({
			code:1
		});
	}
})

//检查用户名是否存在
router.get('/checkUsername',(req,res)=>{
	// console.log(req.query);
	Mall
	.findOne({username:req.query.username})
	.then((data)=>{
		if(data){
			res.json({
				code:1,
				message:'用户名已存在'
			});
		}else{
			res.json({
				code:0
			});
		}
	})
})

// 用户退出

router.get('/logout',(req,res)=>{
	result={
		code:0,//成功
		message:'退出成功'
	};
	// 将cookies设置成空
	// req.cookies.set('userInfo',null);

	//将session破坏掉 
	req.session.destroy();
	res.json(result);
})

//获取商品信息
router.get('/getGoodsList',(req,res)=>{
	let page=req.query.page;
	let query={status:0};

	if(req.query.categoryId){
		query.sonId=req.query.categoryId
	}else{
		query.name={$regex:new RegExp(req.query.keyword,'i')}
	}
	let field='_id name sonId price image';
	let sort={_id:-1};
	if(req.query.orderBy=='price-ascending'){
		sort={price:1}
	}else if(req.query.orderBy=='price-down'){
		sort={price:-1}
	}

	Goods.findPagingGoods(req,query,field,sort)
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
		res.json({
			code:1,
			message:'获取商品信息失败'
		})
	})
})

//获取商品详情页
router.get('/getDetailInfo',(req,res)=>{
	Goods.findOne({status:0,_id:req.query.productId}).
	then((result)=>{
		res.json({
			code:0,
			data:result
		})
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'获取详情页错误'
		})
	})
})

//权限控制
router.use((req,res,next)=>{
	if(req.userInfo.id){
		next();
	}else{
		res.json({
			code:10
		});
	}

})
//获取用户信息
router.get('/getUserInfo',(req,res)=>{
	if(req.userInfo.id){
		Mall.findById(req.userInfo.id,"username email createdAt")
		.then((userInfo)=>{
			res.json({
				code:0,
				data:userInfo
			})
		})
	}else{
		res.json({
			code:1
		});
	}
})

//更新密码
router.post('/updatePassword',(req,res)=>{
	console.log('req.userInfo',req.userInfo);
	Mall
	.update({_id:req.userInfo.id},{password:hmac(req.body.newPassword)})
	.then((data)=>{
		res.json({
			code:0,//成功
			message:'修改密码成功',
			data:data
		});
	})
	.catch((e)=>{
		console.log(e);
		res.json({
			code:1,//成功
			message:'修改密码失败'
		});
	})
})



module.exports=router;