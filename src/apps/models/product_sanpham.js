const mongoose = require("../../common/database")();

const product_sanphamSchema = new mongoose.Schema({
    nhomsp_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu_nhom_sanpham",
    }],
    name: {
        type: String,
        required: true,
        text: true,
    },
    slug:{
        type: String,
        required: true,
    },
    sku:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    sale:{
        type: Number,
        required: true,
    },
    content:{
        type: String,
        required: true,
    },
    anhsang:[],
    congsuat:[],
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    keywords: {
        type: String,
        required: true,
    }, 
    noibat: [],
    thongso: [],
    mota: [],
    huongdan: [],
    baohanh: [],
    
    image: [{
        images: {
            type: String,
            required: true,
        },
        stt: {
            type: String,
            required: true
        }
    }],
    nhap: {
        type: Boolean,
    },
        view: {
        type: Number,
    },
 
    
}, {
    timestamps: true,
});

const Product_sanphamModel = mongoose.model("Product_sanpham", product_sanphamSchema, "product_sanpham");
module.exports = Product_sanphamModel; 
