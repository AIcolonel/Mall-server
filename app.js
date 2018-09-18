const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Cookies=require('cookies');
const session = require('express-session');
const MongoStore = require("connect-mongo")(session); 
  
 
//1.启动数据库
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mallsystem',{ useNewUrlParser: true });
var db = mongoose.connection;

db.once('open',()=>{
	console.log('BD connect......')
})

// 设置跨域请求
app.use((req,res,next)=>{
	res.append("Access-Control-Allow-Origin","http://localhost:8080");
	res.append("Access-Control-Allow-Credentials",true);
	res.append("Access-Control-Allow-Methods","GET, POST, PUT,DELETE");
	res.append("Access-Control-Allow-Headers", "Content-Type, X-Requested-With,X-File-Name"); 
	next();
})

//3.处理静态页面
app.use(express.static('static'));

app.use((req,res,next)=>{
    if(req.method == 'OPTION'){
        res.send('OPTION OK')
    }else{
        next();
    }
})

app.use(session({
	//设置cookie名称
    name:'zhuangzhuangchen',
    //用它来对session cookie签名，防止篡改
    secret:'dsjfkdfd',
    //强制保存session即使它并没有变化
    resave: true,
    //强制将未初始化的session存储
    saveUninitialized: true, 
    //如果为true,则每次请求都更新cookie的过期时间
    rolling:false,
    //cookie过期时间 1天
    cookie:{maxAge:1000*60*60*24},    
    //设置session存储在数据库中
    store:new MongoStore({ mongooseConnection: mongoose.connection })   
}))
 
app.use((req,res,next)=>{
	req.userInfo=req.session.userInfo || {};

	next();

    console.log("req::",req.userInfo);
})

//4.处理post请求中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
 
//5.处理路由
 
// 显示首页
app.use('/',require('./router/index.js'));
 
// 处理用户注册,登录请求
app.use('/user',require('./router/user.js'));

// 进入管理或用户中心或退出管理系统
app.use('/admin',require('./router/admin.js'));

// 处理分类管理路由
app.use('/category',require('./router/category.js'));

//处理文章管理路由
app.use('/article',require('./router/article.js'));

// 处理评论路由
app.use('/comment',require('./router/comment.js'));

//处理新增资源路由
app.use('/resource',require('./router/resource.js'));

//处理用户信息中心首页路由
app.use('/home',require('./router/home.js'));

//处理商品信息路由
app.use('/goods',require('./router/goods.js'));

//处理添加购物车路由
app.use('/cart',require('./router/cart.js'));

//处理获取用户地址列表路由
app.use('/shipping',require('./router/shipping.js'));

//处理获取商品订单列表路由
app.use('/order',require('./router/order.js'));

//处理订单支付路由
app.use('/payment',require('./router/payment.js'));


app.listen(3000,()=>{
	console.log('app is running in the 127.0.0.1:3000');
})