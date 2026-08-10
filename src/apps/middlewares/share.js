
const Thong_tin_trangModel = require("../models/thong_tin_trang");
const Menu_danhmuc_sanphamModel = require("../models/menu_danhmuc_sanpham")
const Menu_nhom_sanphamModel = require("../models/menu_nhom_sanpham");
module.exports = async (req, res, next)=>{

    res.locals.thongtintrang = await Thong_tin_trangModel.findOne();
    res.locals.menu1 = await Menu_danhmuc_sanphamModel.find();
    res.locals.menu2 = await Menu_nhom_sanphamModel.find();


    res.locals.totalQty = req.session.cart.reduce((total, item) => total + item.qty, 0);



    

    res.locals.email = req.session.email;
     if (req.method === 'GET' && !req.originalUrl.match(/\.(js|css|png|jpg|svg|ico|woff2?)$/) && !req.originalUrl.includes('wc-ajax')) {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    //lấy url hiện tại
    res.locals.fullUrl = fullUrl;
  }
    next();
}
