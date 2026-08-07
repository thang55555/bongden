const mongoose = require("../../common/database")();

const baiviettintucSchema = new mongoose.Schema({
    menutintuc_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu_tintuc",
    },
    name: {
        type: String,
        required: true,
        text: true,
    },
    nhap: {
        type: Boolean,
    },
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
    slug:{
        type: String,
        required: true,
    },
    images: {
        type: String,
        required: true,
    },
    view: {
        type: Number,
    },
    content: [],
    
}, {
    timestamps: true,
});

const BaiviettintucModel = mongoose.model("Baiviet_tintuc", baiviettintucSchema, "baiviet_tintuc");
module.exports = BaiviettintucModel; 
