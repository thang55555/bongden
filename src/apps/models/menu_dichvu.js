const mongoose = require("../../common/database")();
const menu_dichvuSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    slug:{
        type: String,
        required: true,
    },
    images:{
        type: String, 
        required: true,
    },
    content: [],
               title: {
        type: String,
        required: true,
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
    
}, {timestamps:true});
const Menu_dichvuModel = mongoose.model("Menu_dichvu", menu_dichvuSchema, "menu_dichvu");
module.exports = Menu_dichvuModel;