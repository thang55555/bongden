const mongoose = require("../../common/database")();

const anh_nhom_san_phamSchema = new mongoose.Schema({
    anhnhom_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu_nhom_sanpham",
    },
    images: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        default: null,
    }
}, {
    timestamps: true,
});

const Anh_nhom_san_phamModel = mongoose.model("Anh_nhom_san_pham", anh_nhom_san_phamSchema, "anh_nhom_san_pham");
module.exports = Anh_nhom_san_phamModel; 
 