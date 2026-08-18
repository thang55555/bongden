const mongoose = require("../../common/database")();
const orderSchema = new mongoose.Schema({
    madonhang:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    sdt:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    namecty:{
        type: String,
        required: true,
    },
    tax:{
        type: String,
        required: true,
    },
    addcty:{
        type: String,
        required: true,
    },
    diachigiaohang:{
        type: String,
    },
    diachigiao:{
        type: String,
    },
    
    note:{
        type: String,
    },
    donvi:{
        type: String,
    },
    dvt:{
        type: String,
    },
    chietkhau:{
        type: Number,
    },
    nvbh:{
        type: String,
    },
    
    vanchuyen:{
        type: String,
    },
    
    thanhtoan:{
        type: String,
    },
    ship:{
        type: Number,
    },
    
    trangthai:{
        type: Boolean,
    },
    item:[],
       
        hoadon: {
        type: Number,
    },
    
}, {timestamps:true});
const OrderModel = mongoose.model("Order", orderSchema, "order");
module.exports = OrderModel;