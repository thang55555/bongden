const mongoose = require("../../common/database")();

const chiaseSchema = new mongoose.Schema({
   
    name: {
        type: String,
        required: true,
    },
    images: {
        type: String,
        required: true, 
    },
    content: {
        type: String,
    }
    
}, {
    timestamps: true,
});

const ChiaseModel = mongoose.model("Chiase", chiaseSchema, "chiase");
module.exports = ChiaseModel; 
