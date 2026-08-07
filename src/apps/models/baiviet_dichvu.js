const mongoose = require("../../common/database")();

const baivietdichvuSchema = new mongoose.Schema({
    menudichvu_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu_dichvu",
    }],
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
    add:{
        type: String,
        required: true,
    },
    view: {
        type: Number,
    },
    content: [],
    image: [{
        images:{
            type: String,
            required: true,
        },
        stt:{
            type: String,
            required: true,
        }
    }]
}, {
    timestamps: true,
});

const BaivietdichvuModel = mongoose.model("Baiviet_dichvu", baivietdichvuSchema, "baiviet_dichvu");
module.exports = BaivietdichvuModel; 
