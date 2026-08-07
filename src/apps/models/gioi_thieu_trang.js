const mongoose = require("../../common/database")();

const gioi_thieu_trangSchema = new mongoose.Schema({
   
    linkvideo: {
        type: String,
        required: true,
    },
    gioithieuchung: [],
    content_tamnhin: [],
    content_sumenh: [],
    img_tamnhin: {
        type: String,
        required: true,
    },
    content_cotloi: [],
    img_cotloi: {
        type: String,
        required: true,
    },
    content_kythuat: [],
    img_kythuat: {
        type: String,
        required: true,
    },
            web: {
        type: [String],
        defadef: [],
    }, 
    
}, {
    timestamps: true,
});

const Gioi_thieu_trangModel = mongoose.model("Gioi_thieu_trang", gioi_thieu_trangSchema, "gioi_thieu_trang");
module.exports = Gioi_thieu_trangModel;
