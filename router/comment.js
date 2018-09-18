const express = require('express');
const router = express.Router();
const Comment=require('../models/comment.js');
 
// 用户评论路由
router.post('/add',(req,res)=>{
	console.log(req.body);
	let body=req.body;
	Comment.insertMany({
		article:body.id,
		user:req.userInfo.id,
		content:body.content
	})
	.then((comment)=>{
		Comment.findPagingComments(req,{article:body.id})
		.then((data)=>{
			res.json({
				code:'0',
				data:data
			})
		})
	})
})

//用户评论分页路由
router.get('/list',(req,res)=>{
	//在Comment模型上定义一个方法，然后调用它

	let article=req.query.id;
	// console.log(req.query);
	let query={};

	// 如果req中有article的数据，则处理的是列表页中分页的处理，如果没有则处理首页的分页
	if(article){
		query.article=article;
	}

	Comment.findPagingComments(req,query)
	.then((data)=>{
		res.json({
			code:'0',
			data:data
		})
	})
})

module.exports=router;