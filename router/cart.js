const express = require('express');
const router = express.Router();
const path = require('path');
const Mall = require('../models/mall.js');
const paging=require('../util/paging.js');
  

//获取购物车数量
router.get('/count',(req,res)=>{
    Mall.findById(req.userInfo.id)
    .then(user=>{
        if(user.cart){
            var newCount=0;
            user.cart.cartList.forEach(item=>{
                newCount += item.count;
            })

            res.json({
                code:0,
                data:newCount
            })
        }else{
            res.json({
                code:0,
                data:0
            })
        }
    })
    .catch(e=>{
        console.log(e);
        res.json({
            code:0,
            data:0
        })
    })
})

router.use((req,res,next)=>{
	if(req.userInfo.id){
		next();
	}else{
		res.json({
            code:10
        });
	}

})

//处理添加购物车路由
router.post('/',(req,res)=>{
    // console.log(req.body);
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        //有购物车信息
        if(user.cart){
            //如果购物车中有该相同的商品，则会在数量上相加，而不是重新生成一个商品节点
            let cartItem = user.cart.cartList.find((item)=>{
                return item.product == req.body.productId
            })
            if(cartItem){
                cartItem.count = cartItem.count + parseInt(req.body.count)
            }else{
                user.cart.cartList.push({
                    product:req.body.productId,
                    count:req.body.count
                })              
            }
        }else{
            //没有购物车信息
            user.cart={
                cartList:[
                    {
                        product:req.body.productId,
                        count:req.body.count
                    }
                ]
            }
        }

        user.save()
        .then((newCart)=>{
            res.json({
                code:0,
                message:'添加购物车成功',
                data:newCart
            })
        })
    })
})

//获取购物车信息
router.get('/',(req,res)=>{
    Mall.findById(req.userInfo.id)
    .then(user=>{
        user.getCart()
        .then(cart=>{
            res.json({
                code:0,
                data:cart
            })          
        })
    })
    .catch(e=>{
        console.log(e);
         res.json({
            code:1,
            message:'获取信息失败'
        })
    })
})

//处理选中一个购物车商品
router.put('/selectOne',(req,res)=>{
    // console.log(req.body);
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        //有购物车信息
        if(user.cart){
            //如果购物车中有该商品，则将其checked属性改变
            let cartItem = user.cart.cartList.find((item)=>{
                return item.product == req.body.productId
            })
            if(cartItem){
                cartItem.checked = true;
            }else{
                res.json({
                    code:1,
                    message:'没有购物车信息'
                })            
            }
        }else{
            //没有购物车信息
            res.json({
                code:1,
                message:'没有购物车信息'
            })
        }

        user.save()
        .then((newCart)=>{
            user.getCart()
            .then(cart=>{
                res.json({
                    code:0,
                    data:cart
                })          
            })
        })
    })
})

//处理取消一个购物车商品
router.put('/offSelectOne',(req,res)=>{
    // console.log(req.body);
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        //有购物车信息
        if(user.cart){
            //如果购物车中有该商品，则将其checked属性改变
            let cartItem = user.cart.cartList.find((item)=>{
                return item.product == req.body.productId
            })
            if(cartItem){
                cartItem.checked = false;
            }else{
                res.json({
                    code:1,
                    message:'没有购物车信息'
                })            
            }
        }else{
            //没有购物车信息
            res.json({
                code:1,
                message:'没有购物车信息'
            })
        }

        user.save()
        .then((newCart)=>{
            user.getCart()
            .then(cart=>{
                res.json({
                    code:0,
                    data:cart
                })          
            })
        })
    })
})

//处理选中全部购物车商品
router.put('/selectAll',(req,res)=>{
    // console.log(req.body);
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        //有购物车信息
        if(user.cart){
            //如果购物车中有该商品，则将其checked属性改变
            user.cart.cartList.forEach((item)=>{
                item.checked=true;
            })
        }else{
            //没有购物车信息
            res.json({
                code:1,
                message:'没有购物车信息'
            })
        }

        user.save()
        .then((newCart)=>{
            user.getCart()
            .then(cart=>{
                res.json({
                    code:0,
                    data:cart
                })          
            })
        })
    })
})

//处理取消选中全部购物车商品
router.put('/offSelectAll',(req,res)=>{
    // console.log(req.body);
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        //有购物车信息
        if(user.cart){
            //如果购物车中有该商品，则将其checked属性改变
            user.cart.cartList.forEach((item)=>{
                item.checked=false;
            })
        }else{
            //没有购物车信息
            res.json({
                code:1,
                message:'没有购物车信息'
            })
        }

        user.save()
        .then((newCart)=>{
            user.getCart()
            .then(cart=>{
                res.json({
                    code:0,
                    data:cart
                })          
            })
        })
    })
})

//删除一条购物车商品
router.put('/deleteOne',(req,res)=>{
    // console.log(req.body);
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        //有购物车信息
        if(user.cart){
            //通过前台ID找到该条购物车信息，然后用filter将其筛选出数组，生成的新数组中没有该条商品信息
            let newCartList=user.cart.cartList.filter(item=>{
                return item.product != req.body.productId
            })
            user.cart.cartList=newCartList;
        }else{
            //没有购物车信息
            res.json({
                code:1,
                message:'没有购物车信息'
            })
        }

        user.save()
        .then((newCart)=>{
            user.getCart()
            .then(cart=>{
                res.json({
                    code:0,
                    data:cart
                })          
            })
        })
    })
})

//删除选中的购物车商品
router.put('/deleteSelected',(req,res)=>{
    // console.log(req.body);
    Mall.findById(req.userInfo.id)
    .then((user)=>{
        //有购物车信息
        if(user.cart){
            //通过遍历数组中checked属性找到选中的购物车信息，然后用filter将其筛选出数组，生成的新数组中没有该条商品信息
            let newCartList=user.cart.cartList.filter(item=>{
                return item.checked == false;
            })
            user.cart.cartList=newCartList;
        }else{
            //没有购物车信息
            res.json({
                code:1,
                message:'没有购物车信息'
            })
        }

        user.save()
        .then((newCart)=>{
            user.getCart()
            .then(cart=>{
                res.json({
                    code:0,
                    data:cart
                })          
            })
        })
    })
})

//更新购物车数量
router.put('/updateCount',(req,res)=>{
    Mall.findById(req.userInfo.id)
    .then(user=>{
        if(user.cart){
            let cartItem = user.cart.cartList.find((item)=>{
                return item.product == req.body.productId
            })
            if(cartItem){
                cartItem.count = req.body.count;
            }else{
                res.json({
                    code:1,
                    message:'没有购物车信息'
                })            
            }
        }else{
            //没有购物车信息
            res.json({
                code:1,
                message:'没有购物车信息'
            })
        }

        user.save()
        .then((newCart)=>{
            user.getCart()
            .then(cart=>{
                res.json({
                    code:0,
                    data:cart
                })          
            })
        })
    })
    .catch(e=>{
        console.log(e);
         res.json({
            code:1,
            message:'获取信息失败'
        })
    })
})
module.exports=router;