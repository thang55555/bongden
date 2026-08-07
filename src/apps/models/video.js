const mongoose = require("../../common/database")();
const videoSchema = new mongoose.Schema({
    tieude:{
        type: String,
        required: true,
    },
    linkvideo:{
        type: String,
        required: true,
    },
    slug:{
        type: String,
        required: true,
    },
    content:{
        type: String,
        required: true,
    },

 
    
}, {timestamps:true});
const VideoModel = mongoose.model("Video", videoSchema, "video");
module.exports = VideoModel;