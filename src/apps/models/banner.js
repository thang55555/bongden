const mongoose = require("../../common/database")();

const bannerSchema = new mongoose.Schema({
   

    images: {
        type: String,
        required: true, 
    },  
      content: []
    
}, {
    timestamps: true,
});

const BannerModel = mongoose.model("Banner", bannerSchema, "banner");
module.exports = BannerModel; 
