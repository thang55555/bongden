const mongoose = require("../../common/database")();
const menu_danhmuc_sanphamSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    slug:{
        type: String,
        required: true,
    },
 
    content: [],
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
    icon: {
        type: String,
        required: true,
    }, 
    images: {
        type: String,
        required: true,
    },

 
    
}, {timestamps:true});
const Menu_danhmuc_sanphamModel = mongoose.model("Menu_danhmuc_sanpham", menu_danhmuc_sanphamSchema, "menu_danhmuc_sanpham");
module.exports = Menu_danhmuc_sanphamModel;