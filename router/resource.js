const express = require('express');
const router = express.Router();
const paging=require('../util/paging.js');
const path = require('path');
const fs = require('fs');
const Resource=require('../models/Resource.js');
  
//引用上传文件包
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'static/resource/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next();
	}else{
		res.send('<h1>请使用管理员账号登录</h1>');
	}

})
//显示资源管理首页路由
router.get('/',(req,res)=>{

	Resource.findPagingResources(req)
	.then((resource)=>{
		res.render('admin/resource-list.html',{
			userInfo:req.userInfo,
			resource:resource.docs,
			page:resource.page,
			list:resource.list,
			pages:resource.pages
		});
	})
})


// 处理新增资源路由
router.get('/add',(req,res)=>{
	res.render('admin/resource-add.html',{
		userInfo:req.userInfo
	});
})

// 处理新增资源post请求
router.post('/add',upload.single('file'),(req,res)=>{
	// console.log(req.body);
	// console.log(req.file);
	new Resource({
		name:req.body.title,
		path:'/resource/'+req.file.filename
	})
	.save()
	.then((resource)=>{
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'添加资源成功',
			url:'/resource'
		})
	})
})

// 处理删除路由
router.get("/delete/:id",(req,res)=>{
	let id = req.params.id;
	Resource.findByIdAndRemove(id)//删除数据库中的记录
	.then((resource)=>{
		let filePath = path.normalize(__dirname + '/../static/'+resource.path);
		//删除物理文件
		fs.unlink(filePath,(err)=>{
			if(!err){
				res.render('admin/success.html',{
					userInfo:req.userInfo,
					message:'删除资源成功',
					url:'/resource'
				})					
			}else{
				res.render('admin/err.html',{
					userInfo:req.userInfo,
					message:'删除资源失败,删除文件错误',
				})					
			}
		})
	})
	.catch((err)=>{
		res.render('admin/err.html',{
			userInfo:req.userInfo,
			message:'删除资源失败,未能完成操作',
		})			
	})
});

module.exports=router;