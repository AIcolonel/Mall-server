const express = require('express');
const router = express.Router();
const Mall=require('../models/mall.js');
const Comment=require('../models/comment.js');
const paging=require('../util/paging.js');
const fs=require('fs');
const path=require('path');
const hmac=require('../util/hmac.js');

//引用上传文件包
const multer = require('multer');
const upload = multer({ dest: 'static/uploads/' });

//插入管理员信息
/*
router.get('/init',(req,res)=>{
	Mall.insertMany({username:'admin',password:hmac('admin'),isAdmin:true})
	.then((result)=>{
		res.send('ok');
	})
	.catch(e=>{
		res.send(e);
	})
})
*/



//验证管理员登录信息
router.post('/login',(req,res)=>{
	console.log(req.body);
	Mall
	.findOne({username:req.body.username,password:hmac(req.body.password)})
	.then((data)=>{
		let result={
			code:0,//成功
			message:'管理员登录成功'
		}

		if(data){
			req.session.userInfo={
				id:data._id,
				username:data.username,
				isAdmin:data.isAdmin
			}
			result.data={
				username:data.username
			};
			res.json(result);
		}else{
			result.code=1;
			result.message='用户名和密码错误';
			res.json(result);
		}
	})
})

// 权限验证是否是管理员
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next();
	}else{
		res.send({
			code:10//用户未登录，需要跳转到登录界面
		});
	}

})

// 获取用户列表信息路由
router.get('/count',(req,res)=>{
	res.json({
		code:0,
		data:{
			usernumber:3000,
			countnumber:301,
			goodsnumber:302
		}
	})
})

// 处理获取用户信息路由
router.get('/users',(req,res)=>{
	let options={
			page:req.query.page,//页码
			model:Mall,//数据库模板
			query:{},//条件
			field:'_id username isAdmin email createdAt',//字段
			sort:{_id:-1},//排序
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
})










// 处理修改密码首页路由
router.get('/changepassword',(req,res)=>{
	res.render('admin/password.html',{
		userInfo:req.userInfo,
	})
})

// 处理提交修改密码表单POST请求
router.post('/password',(req,res)=>{
	let body=req.body;
	console.log(body);
	Blog.update({_id:req.userInfo.id},{password:hmac(body.password)})
	.then((result)=>{
		// 用户修改密码成功后需要重新登录，因此要返回登录界面，且是退出登录状态
		req.session.destroy();
		res.render('admin/success.html',{
			userInfo:req.userInfo,
			message:'更新密码成功',
			url:'/'
		})
	})
})

module.exports=router;