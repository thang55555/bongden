const mongoose = require("../../common/database")();

const lobanSchema = new mongoose.Schema({
   
    title: {
        type: String,
        required: true,
    },
    metadescription: {
        type: String,
    },
    metakeywords: {
        type: String,
    }, 
    content: {
        type: String,
    }
    
}, {
    timestamps: true,
});

const LobanModel = mongoose.model("Lo-ban", lobanSchema, "lo-ban");
module.exports = LobanModel; 
