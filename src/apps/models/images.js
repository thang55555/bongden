const mongoose = require("../../common/database")();

const imagesSchema = new mongoose.Schema({
   
   
    images: {
        type: String,
        required: true, 
    },
    note: {
        type: String,
    }
    
}, {
    timestamps: true,
});

const ImagesModel = mongoose.model("Image", imagesSchema, "images");
module.exports = ImagesModel; 
