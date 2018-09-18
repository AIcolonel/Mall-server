const express = require('express');
const router = express.Router();
const Category=require('../models/category.js');
const paging=require('../util/paging.js');

router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next();
	}else{
		res.json({
			code:10
		});
	}

})

// 处理post表单提交
router.post('/',(req,res)=>{
	// console.log(req.body);
	//在插入数据前首先判断数据库中是否有该数据
	Category.findOne({name:req.body.name,pid:req.body.pid})
	.then((result)=>{
		if(result){//已经存在该分类
			// res.send('该信息已经存在');
			res.json({
				code:1,
				message:'插入分类失败，该分类可能已经存在'
			})
		}else{//没有该数据，可以进行插入
			Category.insertMany({
				name:req.body.name,
				pid:req.body.pid
			})
			.then((newCate)=>{
				if(newCate){
					// res.send('插入数据成功');
					//判断插入的是否是一级分类，如果是再进行一次查找
					if(req.body.pid==0){
						Category.find({pid:0})
						.then((categoryDocs)=>{
							res.json({
								code:0,
								data:categoryDocs
							});
						})
					}else{
						res.json({
							code:0,
							message:'成功插入分类'
						})
					}
				}
			})
			.catch((err)=>{
				res.json({
					code:1,
					message:'操作失败，服务器端异常'
				})
			})
		}
	})
})

//获取分类目录信息
router.get('/',(req,res)=>{
	// console.log(req.query);
	if(req.query.page){
		let options={
			page:req.query.page,//页码
			model:Category,//数据库模板
			query:{pid:req.query.pid},//条件
			field:'_id name order pid',//字段
			sort:{order:1},//排序
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
		Category.find({pid:req.query.pid})
		.then((category)=>{
			res.json({
				code:0,
				data:category
			});
		})
		.catch(e=>{
			res.json({
				code:1,
				message:'获取分类信息失败，服务器端异常'
			})
		})
	}
})

//处理更新分类路由
router.put('/updateName',(req,res)=>{
	console.log(req.body);
	//在更新分类数据前首先判断数据库中是否有该数据
	Category.findOne({name:req.body.name,_id:req.body.id})
	.then((result)=>{
		if(result){//已经存在该分类
			// res.send('该信息已经存在');
			res.json({
				code:1,
				message:'更新分类失败，该分类可能已经存在'
			})
		}else{//没有该数据，可以进行更新
			Category.update({_id:req.body.id},{name:req.body.name})
			.then((newCate)=>{
				if(newCate){
					//更新分类成功，然后需要重新获取分页信息渲染页面
					let options={
						page:req.body.page,//页码
						model:Category,//数据库模板
						query:{pid:req.body.pid},//条件
						field:'_id name order pid',//字段
						sort:{order:1},//排序
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
				}
			})
			.catch((err)=>{
				res.json({
					code:1,
					message:'操作失败，服务器端异常'
				})
			})
		}
	})
})

//处理更新排序路由
router.put('/updateOrder',(req,res)=>{
	console.log(req.body);
	Category.update({_id:req.body.id},{order:req.body.order})
	.then((newCate)=>{
		if(newCate){
			//更新排序成功，然后需要重新获取分页信息渲染页面
			let options={
				page:req.body.page,//页码
				model:Category,//数据库模板
				query:{pid:req.body.pid},//条件
				field:'_id name order pid',//字段
				sort:{order:1},//排序
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
		}
	})
	.catch((err)=>{
		res.json({
			code:1,
			message:'操作失败，服务器端异常'
		})
	})
})












// 获取分类管理页面
router.get('/',(req,res)=>{
	/*
	//找到分类信息并插入页面
	Category.find({},'_id name order')
	.then((categories)=>{
		res.render('admin/category-list.html',{
			userInfo:req.userInfo,
			categories:categories
		});
	})
	*/

	let options={
			page:req.query.page,//页码
			model:Category,//数据库模板
			query:{},//条件
			field:'_id name order',//字段
			sort:{order:1},//排序
		}
	paging(options)
	.then((data)=>{
		res.render('admin/category-list.html',{
			userInfo:req.userInfo,
			categories:data.docs,
			page:data.page,
			list:data.list,
			pages:data.pages
		});
	})
})

// 获取新增分类页面
router.get('/add',(req,res)=>{
	res.render('admin/category-add.html',{
		userInfo:req.userInfo
	});
}) 

// 处理post表单提交
router.post('/add',(req,res)=>{
	// console.log(req.body);
	//在插入数据前首先判断数据库中是否有该数据
	Category.findOne({name:req.body.name})
	.then((result)=>{
		if(result){//已经存在该数据
			// res.send('该信息已经存在');
			res.render('admin/err.html',{
				userInfo:req.userInfo,
				message:'操作失败，该分类已经存在'
			})
		}else{//没有该数据，可以进行插入
			Category.insertMany({
				name:req.body.name,
				order:req.body.order
			})
			.then((newCate)=>{
				if(newCate){
					// res.send('插入数据成功');
					res.render('admin/success.html',{
						userInfo:req.userInfo,
						message:'成功插入数据',
						url:'/category'
					})
				}
			})
			.catch((err)=>{
				res.render('admin/err.html',{
					userInfo:req.userInfo,
					message:'操作失败，数据异常'
				})
			})
		}
	})
})


//处理编辑路由
router.get('/edit/:id',(req,res)=>{
	Category.findOne({_id:req.params.id})
	.then((category)=>{
		res.render('admin/category-edit.html',{
			userInfo:req.userInfo,
			category:category
		});
	})
	
})

// 提交分类编辑POST路由
router.post('/edit',(req,res)=>{
	// console.log(req.body)
	Category.findOne({name:req.body.name})
	.then((result)=>{
		// console.log(req.body);
		if(result && result.order){//数据库中已经存在该分类名称
			res.render('admin/err.html',{
				userInfo:req.userInfo,
				message:'操作失败，该名称已经被应用'
			})
		}else{//数据库中没有该分类名称，可以修改
			Category.updateOne({_id:req.body.id},{name:req.body.name,order:req.body.order},(err,docs)=>{
				if(err){//更新数据失败
					console.log(err)
				}else{//更新数据成功
					res.render('admin/success.html',{
						userInfo:req.userInfo,
						message:'成功更新数据',
						url:'/category'
					})
				}
			})
		}
	})
})

//处理删除路由
router.get('/delete/:id',(req,res)=>{
	// console.log(req.params.id);
	Category.remove({_id:req.params.id},(err,docs)=>{
		if(err){//删除数据失败
			res.render('admin/err.html',{
				userInfo:req.userInfo,
				message:'操作失败，数据库异常'
			})
		}else{//删除数据成功
			res.render('admin/success.html',{
				userInfo:req.userInfo,
				message:'成功删除数据',
				url:'/category'
			})
		}
	})
})
module.exports=router;