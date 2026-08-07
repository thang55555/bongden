const mongoose = require("../../common/database")();
const thong_tin_trangSchema = new mongoose.Schema({
    sdt:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    diachi:{
        type: String,
        required: true,
    },
    mst:{
        type: String,
        required: true,
    },
    content:{
        type: String,
        required: true,
    },
    fb:{
        type: String,
        required: true,
    },
    yt:{
        type: String,
        required: true,
    },
    zalo:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    keywords:{
        type: String,
        required: true,
    },
    gioithieu:{
        type: String,
        required: true,
    },
    images:{
        type: String,
        required: true,
    },

 
    
}, {timestamps:true});
const Thong_tin_trangModel = mongoose.model("Thong_tin_trang", thong_tin_trangSchema, "thong_tin_trang");
module.exports = Thong_tin_trangModel;