const express = require('express');
const router = express.Router();
const Blog=require('../models/mall.js');
const Comment=require('../models/comment.js');
const paging=require('../util/paging.js');
const fs=require('fs');
const path=require('path');
const hmac=require('../util/hmac.js');

//引用上传文件包
const multer = require('multer');
const upload = multer({ dest: 'static/uploads/' });

router.use((req,res,next)=>{
	if(!req.userInfo.isAdmin){
		next();
	}else{
		res.send('<h1>请使用用户账号登录</h1>');
	}

})

router.get('/',(req,res)=>{
	res.render('home/home.html',{
		userInfo:req.userInfo
	});
})

// 处理评论管理页面路由
router.get('/comments',(req,res)=>{
	Comment.findPagingComments(req,{user:req.userInfo.id})
	.then((comment)=>{
		res.render('home/comment-list.html',{
			userInfo:req.userInfo,
			comment:comment.docs,
			list:comment.list,
			page:comment.page,
			pages:comment.pages
		})
	})
})

// 处理评论删除路由
router.get('/comment/delete/:id',(req,res)=>{
	Comment.remove({_id:req.params.id},(err,docs)=>{
		if(err){//删除数据失败
			res.render('home/err.html',{
				userInfo:req.userInfo,
				message:'操作失败，未能删除评论',
			})
		}else{//删除数据成功
			res.render('home/success.html',{
				userInfo:req.userInfo,
				message:'成功删除评论',
				url:'/home/comments'
			})
		}
	})
})

// 处理修改密码首页路由
router.get('/changepassword',(req,res)=>{
	res.render('home/password.html',{
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
		res.render('home/success.html',{
			userInfo:req.userInfo,
			message:'更新密码成功',
			url:'/'
		})
	})
})

module.exports=router;