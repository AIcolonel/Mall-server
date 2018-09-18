const express = require('express');
const router = express.Router();
const Article=require('../models/article.js');
const Category=require('../models/category.js');
const paging=require('../util/paging.js');
 
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next();
	}else{
		res.send('<h1>请使用管理员账号登录</h1>');
	}

})

// 获取文章管理页面
router.get('/',(req,res)=>{
	let options={
			page:req.query.page,//页码
			model:Article,//数据库模板
			query:{},//条件
			field:'-__v',//字段
			sort:{_id:-1},//排序
			populate:[{path:'category',select:'name'},{path:'author',select:'username'}]
		}
	paging(options)
	.then((data)=>{
		res.render('admin/article-list.html',{
			userInfo:req.userInfo,
			articles:data.docs,
			page:data.page,
			list:data.list,
			pages:data.pages
		});
	})


	// res.render('admin/article-list.html');
})

// 处理文章新增路由
router.get('/add',(req,res)=>{

	// 查找数据库中的文章类型
	Category.find({},'_id name')
	.sort({order:1})
	.then((category)=>{
		res.render('admin/article-add.html',{
			userInfo:req.userInfo,
			category:category
		});
	})
	
})
 
// 处理文章提交post请求
router.post('/add',(req,res)=>{
	// console.log(req.body);
	// console.log(req.userInfo._id);
	Article.insertMany({
		category:req.body.category,
		author:req.userInfo.id,
		title:req.body.title,
		intro:req.body.intro,
		content:req.body.content
	})
	.then((article)=>{//插入文章成功
		res.render('admin/success.html',{
			userInfo:req.userInfo,
			message:'插入文章数据成功',
			url:'/article'
		})
	})
	.catch((err)=>{
		res.render('admin/err.html',{
			userInfo:req.userInfo,
			message:'操作失败，未能插入文章数据'
		})
	})
})

// 处理文章编辑路由
router.get('/edit/:id',(req,res)=>{
	// 首先要获取文章类型的数据
	let id=req.params.id;
	Category.find({},'_id name')
	.sort({order:1})
	.then((category)=>{
		Article.findById(id)
		.then((articles)=>{
			res.render('admin/article-edit.html',{
				userInfo:req.userInfo,
				articles:articles,
				category:category
			});
		})
	})
})

//处理文章编辑完成后，提交POST路由
router.post('/edit',(req,res)=>{
	// console.log(req.body);
	let body=req.body;
	let options={
		category:body.category,
		title:body.title,
		intro:body.intro,
		content:body.content
	}

	Article.updateOne({_id:body.id},options,(err,docs)=>{
		if(err){//更新数据失败
			res.render('admin/err.html',{
				userInfo:req.userInfo,
				message:'操作失败，未能更新文章'
			})
		}else{//更新数据成功
			res.render('admin/success.html',{
				userInfo:req.userInfo,
				message:'成功更新文章',
				url:'/article'
			})
		}
	})
})

//处理文章删除路由
router.get('/delete/:id',(req,res)=>{
	// console.log(req.params.id);

	Article.remove({_id:req.params.id},(err,docs)=>{
		if(err){//删除数据失败
			res.render('admin/err.html',{
				userInfo:req.userInfo,
				message:'操作失败，数据库异常',
			})
		}else{//删除数据成功
			res.render('admin/success.html',{
				userInfo:req.userInfo,
				message:'成功删除数据',
				url:'/article'
			})
		}
	})
})
module.exports=router;