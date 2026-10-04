const mongoose = require("../../common/database")();

const danhgiaSchema = new mongoose.Schema({
   
    
    productId: {
        type: String,
    },
    name: {
        type: String,
    },
    content: {
        type: String,
    },
    images: [{
            type: String,
            required: true,
    }],
    rating: {
        type: Number,
    },
    like: {
        type: Number,
    }
    
}, {
    timestamps: true,
});

const DanhgiaModel = mongoose.model("Danhgia", danhgiaSchema, "danhgia");
module.exports = DanhgiaModel; 