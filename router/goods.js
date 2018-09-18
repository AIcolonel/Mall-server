const express = require('express');
const router = express.Router();
const path = require('path');
const Goods = require('../models/goods.js');
const paging=require('../util/paging.js');
  
//引用上传文件包
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/upload-image/')
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


// 处理新增图片资源post请求
router.post('/uploadImg',upload.single('file'),(req,res)=>{
    res.send('http://127.0.0.1:3000/upload-image/'+req.file.filename);
})

// 处理详情页图片资源post请求
router.post('/uploadDetailImg',upload.single('upload_file'),(req,res)=>{
    const filePath='http://127.0.0.1:3000/upload-image/'+req.file.filename;
    // console.log(filePath);
    res.json({
        success: true,
        msg: "上传详情图片成功",
        file_path: filePath
    })
})

// 处理添加商品post表单提交
router.post('/',(req,res)=>{
    // console.log(req.body);
    Goods.insertMany({
        name:req.body.name,
        describe:req.body.describe,
        sonId:req.body.sonId,
        price:req.body.price,
        number:req.body.number,
        image:req.body.image,
        value:req.body.value
    })
    .then((newCate)=>{
        Goods.findPagingGoods(req)
        .then((docs)=>{
            res.json({
                code:0,
                data:{
                    current:docs.current,//当前页码
                    list:docs.list,//当前页的内容
                    total:docs.total,//总页数
                    pageSize:docs.pageSize//每页显示的条数
                }
            });
        })
    })
    .catch((err)=>{
        console.log(err);
        res.json({
            code:1,
            message:'操作失败，服务器端异常'
        })
    })
})

// 处理编辑商品put表单提交
router.put('/',(req,res)=>{
    // console.log(req.body);
    let update= {
        name:req.body.name,
        describe:req.body.describe,
        sonId:req.body.sonId,
        price:req.body.price,
        number:req.body.number,
        image:req.body.image,
        value:req.body.value
    }
    Goods.update({_id:req.body.id},update)
    .then((raw)=>{
        res.json({
            code:0,
            message:'编辑商品成功'
        })
    })
    .catch((err)=>{
        console.log(err);
        res.json({
            code:1,
            message:'编辑商品失败，服务器端异常'
        })
    })
})

//获取商品目录信息
router.get('/',(req,res)=>{
    // console.log(req.query);
    if(req.query.page){
        let options={
            page:req.query.page,//页码
            model:Goods,//数据库模板
            query:{},//条件
            field:'_id name status order',//字段
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
        Goods.find()
        .then((goods)=>{
            res.json({
                code:0,
                data:goods
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

//处理更新排序路由
router.put('/updateOrder',(req,res)=>{
    // console.log(req.body);
    Goods.update({_id:req.body.id},{order:req.body.order})
    .then((newCate)=>{
        if(newCate){
            //更新排序成功，然后需要重新获取分页信息渲染页面
            let options={
                page:req.body.page,//页码
                model:Goods,//数据库模板
                query:{},//条件
                field:'_id name status order',//字段
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

//处理商品状态status路由
router.put('/updateStatus',(req,res)=>{
    // console.log(req.body);
    Goods.update({_id:req.body.id},{status:req.body.status})
    .then((newCate)=>{
        if(newCate){
            let options={
                page:req.body.page,//页码
                model:Goods,//数据库模板
                query:{},//条件
                field:'_id name status order',//字段
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


//处理编辑商品信息路由
router.get('/editGoods',(req,res)=>{
    // console.log(req.query);
    const id=req.query.id;
    Goods.findById(id)
    .populate({path:'sonId',select:'_id pid'})
    .then((goods)=>{
        res.json({
            code:0,
            data:goods 
        });
    })
    .catch(e=>{
        res.json({
            code:1,
            message:'编辑商品信息失败，服务器端异常'
        })
    })
})

//处理搜索商品路由
router.get('/searchGoods',(req,res)=>{
    console.log(req.query);
    let page=req.query.page || 1;
    let keyword=req.query.keyword;
    let options={
            page:page,//页码
            model:Goods,//数据库模板
            query:{name:{$regex:new RegExp(keyword,'i')}},//条件
            field:'_id name status order',//字段
            sort:{order:1},//排序
        }
        paging(options)
        .then((result)=>{
            res.json({
                code:0,
                data:{
                    keyword:keyword,
                    current:result.current,//当前页码
                    list:result.list,//当前页的内容
                    total:result.total,//总页数
                    pageSize:result.pageSize//每页显示的条数
                }
            });
        })
        .catch(e=>{
            res.json({
                code:1,
                message:'搜索商品信息失败，服务器端异常'
            })
        })
})

module.exports=router;