const mongoose = require('mongoose');

const Goods = require('./goods.js');

const CartItemSchema=new mongoose.Schema({
  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Goods'
  },
  count:{
    type:Number,
    default:0
  },
  totalPrice:{
    type:Number,
    default:0
  },
  checked:{
    type:Boolean,
    default:true
  }
  
})

const CartSchema=new mongoose.Schema({
  cartList:{
    type:[CartItemSchema]
  },
  totalCartPrice:{
    type:Number,
    default:0
  },
  allChecked:{
    type:Boolean,
    default:true
  }
})


//定义一个新schema，mongoose支持内嵌文档
const ShippingSchema=new mongoose.Schema({
  username:{
    type:String
  },
  province:{
    type:String
  },
  city:{
    type:String
  },
  address:{
    type:String
  },
  userphone:{
    type:Number
  },
  zip:{
    type:Number,
    default:000000
  }
})

// 生成一个Schema模型
const MallSchema = new mongoose.Schema({
  	username:{
  		type:String
  	},
  	password:{
  		type:String
  	},
  	isAdmin:{
  		type:Boolean,
  		default:false
  	},
    email:{
      type:String
    },
    cart:{
      type:CartSchema
    },
    shipping:{
      type:[ShippingSchema],
      default:[]
    }
},{
  timestamps:true
});

//生成实例方法
MallSchema.methods.getCart=function(){
    var _this=this
    return new Promise((resolve,reject)=>{
        //如果没有购物车信息返回空对象
        if(!this.cart){
            resolve({
                cartList:[]
            });
        }

        let getCartItem=function(){
            return _this.cart.cartList.map((cartItem)=>{
                return Goods.findById(cartItem.product)
                .then(product=>{
                    cartItem.product=product;
                    cartItem.totalPrice=product.price*cartItem.count;
                    return cartItem;
                })
            })
        }

        Promise.all(getCartItem())
        .then((cartItems)=>{
            //计算总价格
            let totalCartPrice=0;
            cartItems.forEach(item=>{
                if(item.checked){
                    totalCartPrice +=item.totalPrice;
                }
            })
            this.cart.totalCartPrice=totalCartPrice;

            // 设置新的购物车列表
            this.cart.cartList=cartItems;

            //判断是否有商品没有被选中
            let hasNotCheckedItem=cartItems.find((item)=>{
                return item.checked==false;
            })

            if(hasNotCheckedItem){
                this.cart.allChecked=false;
            }else{
                this.cart.allChecked=true;
            }

            resolve(this.cart);
        })
    })
}

//生成实例方法,获取订单商品列表
MallSchema.methods.getOrderList=function(){
    var _this=this
    return new Promise((resolve,reject)=>{
        //如果没有购物车信息返回空对象
        if(!this.cart){
            resolve({
                cartList:[]
            });
        }

        let getCartItem=function(){
            let newOrderList=_this.cart.cartList.filter(orderItem=>{
              return orderItem.checked
            })
            return newOrderList.map((cartItem)=>{
                return Goods.findById(cartItem.product)
                .then(product=>{
                    cartItem.product=product;
                    cartItem.totalPrice=product.price*cartItem.count;
                    return cartItem;
                })
            })
        }

        Promise.all(getCartItem())
        .then((cartItems)=>{
            //计算总价格
            let totalCartPrice=0;
            cartItems.forEach(item=>{
                if(item.checked){
                    totalCartPrice +=item.totalPrice;
                }
            })
            this.cart.totalCartPrice=totalCartPrice;

            // 设置新的购物车列表
            this.cart.cartList=cartItems;

            resolve(this.cart);
        })
    })
}

// 利用Schema生成model
const Mall = mongoose.model('Mall', MallSchema);

module.exports=Mall;