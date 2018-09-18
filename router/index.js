const express = require('express');
const router = express.Router();
const Category=require('../models/category.js');
const Article=require('../models/article.js');
const Comment=require('../models/comment.js');
const paging=require('../util/paging.js');
const getCommonData=require('../util/getCommonData.js');

router.get('/',(req,res)=>{
  
	// 在数据库中查找首页文章类型的信息,调用getCommonData函数
	getCommonData()
	.then((result)=>{
		// console.log(result);
		//在article模型上定义一个方法，然后调用它
		Article.findPagingArticles(req)
		.then((data)=>{
			res.render('front/index.html',{
				userInfo:req.userInfo,
				articles:data.docs,
				page:data.page,
				list:data.list,
				pages:data.pages,
				categories:result.category,
				clickList:result.clickList,
				siteDate:result.siteDate
			});
		})
	})
		

})

// ajax:处理首页点击页码get请求
router.get('/articles',(req,res)=>{
	/*
	// 在数据库中查找文章的信息
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
		res.json({
			code:0,
			data:data
		})
	})
	*/
	//在article模型上定义一个方法，然后调用它

	let category=req.query.id;
	// console.log(req.query);
	let query={};

	// 如果req中有category的数据，则处理的是列表页中分页的处理，如果没有则处理首页的分页
	if(category){
		query.category=category;
	}

	Article.findPagingArticles(req,query)
	.then((data)=>{
		res.json({
			code:'0',
			data:data
		})
	})
})

//获取文章详情页路由
router.get('/view/:id',(req,res)=>{
	// console.log(req.params.id);
	
	let id=req.params.id;
	/*
	Article.findByIdAndUpdate(id,{$inc:{click:1}},{new:true})
	.populate('category','name')
	.then((article)=>{
		Category.find({},'_id name')
		.sort({order:1})
		.then((category)=>{//获取分类
			Article.find({},'_id click intro')
			.sort({click:-1})
			.limit(10)
			.then((clickList)=>{
				res.render('front/detail.html',{
					userInfo:req.userInfo,
					article:article,
					category:category,
					clickList:clickList
				})
			})
		})
	})
	*/
	Article.findByIdAndUpdate(id,{$inc:{click:1}},{new:true})
	.populate('category','name')
	.then((article)=>{
		getCommonData()
		.then((data)=>{
			Comment.findPagingComments(req,{article:id})
			.then((comments)=>{
				res.render('front/detail.html',{
					userInfo:req.userInfo,
					article:article,
					categories:data.category,
					clickList:data.clickList,
					comments:comments.docs,
					page:comments.page,
					list:comments.list,
					pages:comments.pages,
					category:article.category._id.toString()
				})
			})

			
		})
	})

})

//获取列表页路由
router.get('/list/:id',(req,res)=>{
	// console.log(req.params.id);
	let id =req.params.id;

	getCommonData()
	.then((data)=>{
		Article.findPagingArticles(req,{category:id})
		.then((result)=>{
			res.render('front/list.html',{
				userInfo:req.userInfo,
				article:result.docs,
				page:result.page,
				list:result.list,
				pages:result.pages,
				categories:data.category,
				clickList:data.clickList,
				category:id
			})
		})
	})
	/*
	Article.find({})
	// .populate('category','name')
	.then((article)=>{
		getCommonData()
		.then((data)=>{
			res.render('front/list.html',{
				userInfo:req.userInfo,
				article:article,
				category:data.category,
				clickList:data.clickList
			})
		})
	})
	*/
})

module.exports=router;