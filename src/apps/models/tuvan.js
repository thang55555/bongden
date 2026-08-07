const mongoose = require("../../common/database")();
const tuvanSchema = new mongoose.Schema({
    matuvan:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    sdt:{
        type: Number,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    khachhang:{
        type: String,
        required: true,
    },
    diachi:{
        type: String,
        required: true,
    },
    nhucau:[],
    noidung:{
        type: String,
        required: true,
    },
    trangthai:{
        type: Boolean,
    },
    images:{
        type: String,
    },
    
}, {timestamps:true});
const TuvanModel = mongoose.model("Tuvan", tuvanSchema, "tuvan");
module.exports = TuvanModel;