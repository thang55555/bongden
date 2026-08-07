const UserModel = require("../models/users");
const TuvanModel = require("../models/tuvan");
const Product_sanphamModel = require("../models/product_sanpham");
const VideoModel = require("../models/video");
const BaiviettintucModel = require("../models/baiviet_tintuc");
const BaivietdichvuModel = require("../models/baiviet_dichvu");
const ChiaseModel = require("../models/chiase");
const ImagesModel = require("../models/images");

const index =  async (req, res)=>{
    const users = await UserModel.find();
    const product = await Product_sanphamModel.find();
    const tuvan = await TuvanModel.find();
    const video = await VideoModel.find();
    const email = req.session.email
    const tintuc = await BaiviettintucModel.find();
    const dichvu = await BaivietdichvuModel.find();
    const chiase = await ChiaseModel.find();
    const image = await ImagesModel.find();
    res.render("./admin/admin", {
        users: users.length,
        product: product.length,
        email,
        tuvan: tuvan.length, 
        video: video.length,
        tintuc: tintuc.length,
        dichvu: dichvu.length,
        chiase: chiase.length,
        image: image.length,

    });
}
module.exports = {
    index
};