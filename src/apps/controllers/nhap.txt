const ejs = require("ejs");
const path = require("path");
const transporter = require("../../common/transporter");
const Gioi_thieu_trangModel = require("../models/gioi_thieu_trang");
const VideoModel = require("../models/video");
const BaiviettintucModel = require("../models/baiviet_tintuc");
const Menu_danhmuc_sanphamModel = require("../models/menu_danhmuc_sanpham");
const Menu_nhom_sanphamModel = require("../models/menu_nhom_sanpham");
const Menu_dichvuModel = require("../models/menu_dichvu");
const Product_sanphamModel = require("../models/product_sanpham");
const pagination = require("../../common/pagination");
const Anh_nhom_san_phamModel = require("../models/anh_nhom_san_pham");
const ChiaseModel = require("../models/chiase");
const BaivietdichvuModel = require("../models/baiviet_dichvu");
const Menu_tintucModel = require("../models/menu_tintuc");
const TuvanModel = require("../models/tuvan");
const Thong_tin_trangModel = require("../models/thong_tin_trang");
const LobanModel = require("../models/loban");
const mongoose = require('mongoose');
// const home = async (req, res) => {
//     const gioithieutrang = await Gioi_thieu_trangModel.find();
//     const video = await VideoModel.find().sort({ _id: -1 }) || [];
//     const idVideo = video[0]._id || [];
//     const videoOne = await VideoModel.findById(idVideo);
//     const tintuc = await BaiviettintucModel.find({nhap: true}).sort({ _id: -1 }) || [];
//     const idtintuc = tintuc[0]._id || []
//     const tintucOne = await BaiviettintucModel.findById(idtintuc)
//     const menudichvu = await Menu_dichvuModel.find({nhap: true}).limit(2);
//     const chiase = await ChiaseModel.find();
//     res.render("site/index", { gioithieutrang, video, videoOne, tintuc, tintucOne, menudichvu, chiase, });
// }
const home = async (req, res) => {
  try {
    const gioithieutrang = await Gioi_thieu_trangModel.find();
    const video = await VideoModel.find().sort({ _id: -1 }) || [];

    let videoOne = null;
    if (video.length > 0) {
      videoOne = await VideoModel.findById(video[0]._id);
    }

    const tintuc = await BaiviettintucModel.find({ nhap: true }).sort({ _id: -1 }) || [];

    let tintucOne = null;
    if (tintuc.length > 0) {
      tintucOne = await BaiviettintucModel.findById(tintuc[0]._id);
    }

    const menudichvu = await Menu_dichvuModel.find({ nhap: true }).limit(2);
    const chiase = await ChiaseModel.find();

    res.render("site/index", { gioithieutrang, video, videoOne, tintuc, tintucOne, menudichvu, chiase });
  } catch (err) {
    console.error("❌ Lỗi tại home:", err);
    res.status(500).send("Có lỗi xảy ra");
  }
};



const categoryDanhmuc = async (req, res) => {
    const id = req.params.id;
    const slug = req.params.slug;
    const menudanhmuc = await Menu_danhmuc_sanphamModel.findById(id);
    const nhomsp = await Menu_nhom_sanphamModel.find({ danhmuc_id: id });


    const product_danhsach = [];
    for (let i = 0; i < nhomsp.length; i++) {
        const products = await Product_sanphamModel.find({ nhomsp_id: nhomsp[i]._id, nhap: true })
        if (products.length > 0) {
            product_danhsach.push(products)
        }
    };
    if (product_danhsach.length > 0) {
        const danhsachId = [];
        for (let i = 0; i < product_danhsach.length; i++) {
            const productstt = product_danhsach[i];
            for (item of productstt) {
                danhsachId.push(item._id)
            }
        }
        const product1 = [];
        for (item of danhsachId) {
            const productItem = await Product_sanphamModel.findById(item);
            product1.push(productItem)
        }
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = page * limit - limit;
        const totalRows = product1.length;
        const totalPages = Math.ceil(totalRows / limit);
        const next = page + 1;
        const hasNext = page < totalPages ? true : false;
        const prev = page - 1;
        const hasPrev = page > 1 ? true : false;
        const product = [];
        if (skip <= totalRows) {
            if (limit * page <= totalRows) {
                for (var i = skip; i < limit * page; i++) {
                    product.push(product1[i])
                }
            }
            else {
                for (var i = skip; i < skip + totalRows % limit; i++) {
                    product.push(product1[i])
                }
            }
        }
        res.render("./site/category_menu", {
            menudanhmuc, nhomsp, product,
            slug, id,
            page,
            totalPages,
            next,
            hasNext,
            prev,
            hasPrev,
            pages: pagination(page, totalPages),
        });
    }
    else {
        const product = [];
        const hasNext = [];
        const hasPrev = [];
        const pages = [];
        const prev = [];
        const next = [];
        res.render("./site/category_menu", {
            menudanhmuc, nhomsp, product,
            slug, id, hasNext, hasPrev, pages, prev, next,
        });
    }

}


const categoryitem = async (req, res) => {
    const id = req.params.id;
    const slug = req.params.slug;
    const category = await Menu_nhom_sanphamModel.findById(id).populate({ path: "danhmuc_id" });
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = page * limit - limit;
    const totalRows = await Product_sanphamModel.find({ nhomsp_id: id, nhap: true }).countDocuments();
    const totalPages = Math.ceil(totalRows / limit)
    const product = await Product_sanphamModel.find({ nhomsp_id: id, nhap: true })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    const next = page + 1;
    const hasNext = page < totalPages ? true : false;
    const prev = page - 1;
    const hasPrev = page > 1 ? true : false;

    const image = await Anh_nhom_san_phamModel.find({ anhnhom_id: id });
    const imageOne = image[0] || [];
    const total = await Anh_nhom_san_phamModel.find({ anhnhom_id: id }).skip(1);
    const chiase = await ChiaseModel.find();
    res.render("./site/category_item", {
        category, product, image, imageOne, total,
        page,
        totalPages,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages),
        slug, id,
        chiase,
    });
}

const categorydichvu = async (req, res) => {
    const id = req.params.id;
    const slug = req.params.slug;
    const category = await Menu_dichvuModel.findById(id);
    const categorynhom = await Menu_dichvuModel.find();

    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = page * limit - limit;
    const totalRows1 = await BaivietdichvuModel.find({ menudichvu_id: id, nhap: true }).countDocuments();
    const totalRows2 = await Product_sanphamModel.find({ menudichvu_id: id, spdv: true, nhap: true }).countDocuments();
    const totalRows = totalRows1 + totalRows2;
    const totalPages = Math.ceil(totalRows / (limit * 2));
    const baiviets = await BaivietdichvuModel
        .find({ menudichvu_id: id, nhap: true })
        .populate({ path: "menudichvu_id" })
        .sort({ _id: -1 });
    const products = await Product_sanphamModel
        .find({ menudichvu_id: id, spdv: true, nhap: true })
        .populate({ path: "menudichvu_id" })
        .sort({ _id: -1 });
    const baiviet = [];
    const product = [];
    if (totalRows1 < totalRows2) {
        if (page * limit <= totalRows1) {
            for (var i = skip; i < page * limit; i++) {
                baiviet.push(baiviets[i])
            };
            for (var i = skip; i < page * limit; i++) {
                product.push(products[i])
            };
        }
        else {
            if (page * limit - totalRows1 < limit) {
                for (var i = skip; i < totalRows1 % limit; i++) {
                    baiviet.push(baiviets[i])
                }
                if (limit * page + limit - totalRows1 % limit <= totalRows2) {
                    for (var i = skip; i < (limit * 2 - totalRows1 % limit); i++) {
                        product.push(products[i])
                    };
                }
                else {
                    for (var i = skip; i < totalRows2; i++) {
                        product.push(products[i])
                    }
                }

            }
            else {
                const page1 = Math.floor(totalRows1 / limit);
                const page2 = page - page1 - 1;
                const ii = (limit * page1) + (limit * 2 - (totalRows1 % limit)) + (limit * 2 * page2);
                if (ii <= totalRows2) {
                    for (var i = ii-(limit * 2); i < ii; i++) {
                        product.push(products[i])
                    };
                }
                else {
                    for (var i = ii-(limit * 2); i < totalRows2; i++) {
                        product.push(products[i])
                    };
                }
            }
        }
    }
    else if (totalRows1 > totalRows2) {
        if (page * limit <= totalRows2) {
            for (var i = skip; i < page * limit; i++) {
                baiviet.push(baiviets[i])
            };
            for (var i = skip; i < page * limit; i++) {
                product.push(products[i])
            };
        }
        else {
            if (page * limit - totalRows2 < limit) {
                for (var i = skip; i < totalRows2 % limit; i++) {
                    product.push(products[i])
                }
                if (limit * page + limit - totalRows2 % limit <= totalRows1) {
                    for (var i = skip; i < (limit * 2 - totalRows2 % limit); i++) {
                    baiviet.push(baiviets[i])
                    };
                }
                else {
                    for (var i = skip; i < totalRows1; i++) {
                        baiviet.push(baiviets[i])
                    }
                }

            }
            else {
                const page1 = Math.floor(totalRows2 / limit);
                const page2 = page - page1 - 1;
                const ii = (limit * page1) + (limit * 2 - (totalRows2 % limit)) + (limit * 2 * page2);
                if (ii <= totalRows1) {
                    for (var i = ii-(limit * 2); i < ii; i++) {
                        baiviet.push(baiviets[i])
                    };
                }
                else {
                    for (var i = ii-(limit * 2); i < totalRows1; i++) {
                        baiviet.push(baiviets[i])
                    };
                }
            }
        }
    }
    else{
        if(page*limit<=totalRows1){
            for(var i=skip; i<page*limit; i++){
                baiviet.push(baiviets[i]);
                product.push(products[i]);
            };
        }
        else{
            for(var i=skip; i<totalRows1; i++){
                baiviet.push(baiviets[i]);
                product.push(products[i]);
            }
        }

    }


    const next = page + 1;
    const hasNext = page < totalPages ? true : false;
    const prev = page - 1;
    const hasPrev = page > 1 ? true : false;

    res.render("./site/category_dichvu", {
        category, categorynhom,
        page,
        totalPages,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages),
        id, slug, product, baiviet,
    });
}

// const productdichvu = async (req, res) => {
//     const id = req.params.id;
//     const product = await BaivietdichvuModel.findById(id);
//     const imgOne = product.image[0].images || [];
//     const total = product.image.length;
//     const category = await Menu_dichvuModel.findById(product.menudichvu_id)
//     const category_noibat = await BaivietdichvuModel.find({nhap: true}).populate({ path: "menudichvu_id" }).sort({ _id: -1 });

//     const image = [];
//     if (total > 1) {
//         for (i = 1; i < total; i++) {
//             item = {
//                 images: product.image[i].images,
//                 stt: product.image[i].stt
//             }
//             image.push(item)
//         }
//     }
//     for (item of image) { console.log(item.images); }
//     res.render("./site/product_dichvu", { product, category, category_noibat, imgOne, image })
// }

// const categoryitintuc = async (req, res) => {
//     const id = req.params.id;
//     const slug = req.params.slug;
//     const category = await Menu_tintucModel.findById(id)
//     const product = await BaiviettintucModel.find({ menutintuc_id: id, nhap: true }).sort({ _id: -1 });
//     const page = parseInt(req.query.page) || 1;
//     const limit = 8;
//     const skip = page * limit - limit;
//     const totalRows = await Product_sanphamModel.find({ spdv: true, nhap: true }).countDocuments();
//     const totalPages = Math.ceil(totalRows / limit)
//     const products = await Product_sanphamModel
//         .find({ spdv: true, nhap: true })
//         .sort({ _id: -1 })
//         .skip(skip)
//         .limit(limit);
//     const next = page + 1;
//     const hasNext = page < totalPages ? true : false;
//     const prev = page - 1;
//     const hasPrev = page > 1 ? true : false;
//     const menuproduct = await Menu_danhmuc_sanphamModel.find();
//     res.render("./site/category_tintuc", {
//         product, category, products, menuproduct, slug, id,
//         page,
//         totalPages,
//         next,
//         hasNext,
//         prev,
//         hasPrev,
//         pages: pagination(page, totalPages),
//     });
// }

const productdichvu = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await BaivietdichvuModel.findById(id);

        if (!product) {
            return res.status(404).send("Không tìm thấy bài viết dịch vụ");
        }

        // Nếu product.image rỗng hoặc không tồn tại thì gán mặc định []
        const total = Array.isArray(product.image) ? product.image.length : 0;
        const imgOne = total > 0 ? (product.image[0]?.images || []) : [];

        const category = await Menu_dichvuModel.findById(product.menudichvu_id);

        const category_noibat = await BaivietdichvuModel.find({ nhap: true })
            .populate({ path: "menudichvu_id" })
            .sort({ _id: -1 });

        // Chuẩn hóa danh sách ảnh
        const image = [];
        if (total > 1) {
            for (let i = 1; i < total; i++) {
                image.push({
                    images: product.image[i]?.images || [],
                    stt: product.image[i]?.stt || i
                });
            }
        }

        res.render("./site/product_dichvu", { product, category, category_noibat, imgOne, image });

    } catch (err) {
        console.error("❌ Lỗi tại productdichvu:", err);
        res.status(500).send("Có lỗi xảy ra khi load dịch vụ");
    }
};

const categoryitintuc = async (req, res) => {
  try {
    const id = req.params.id;   // cái này có thể là ObjectId hoặc slug
    const slug = req.params.slug;

    // nếu id không phải ObjectId thì dùng findOne theo slug
    const category = mongoose.isValidObjectId(id) 
      ? await Menu_tintucModel.findById(id)
      : await Menu_tintucModel.findOne({ slug: id });

    if (!category) {
      return res.status(404).send("Không tìm thấy danh mục");
    }

    const product = await BaiviettintucModel.find({ menutintuc_id: category._id, nhap: true }).sort({ _id: -1 });

    // phân trang sản phẩm
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = page * limit - limit;
    const totalRows = await Product_sanphamModel.countDocuments({ spdv: true, nhap: true });
    const totalPages = Math.ceil(totalRows / limit);

    const products = await Product_sanphamModel
      .find({ spdv: true, nhap: true })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    const menuproduct = await Menu_danhmuc_sanphamModel.find();

    res.render("./site/category_tintuc", {
      product,
      category,
      products,
      menuproduct,
      slug,
      id,
      page,
      totalPages,
      next: page + 1,
      hasNext: page < totalPages,
      prev: page - 1,
      hasPrev: page > 1,
      pages: pagination(page, totalPages),
    });
  } catch (err) {
    console.error("❌ Lỗi tại categoryitintuc:", err);
    res.status(500).send("Có lỗi xảy ra");
  }
};



// const productTinTuc = async (req, res) => {
//     const id = req.params.id;
//     const product = await BaiviettintucModel.findById(id);
//     const idcate = product.menutintuc_id
//     const category = await Menu_tintucModel.findById(idcate)
//     const baiviet = await BaiviettintucModel.find({ menutintuc_id: product.menutintuc_id, nhap: true}).sort({ _id: -1 });;
//     res.render("./site/product_tintuc", { product, baiviet, category });
// }

const productTinTuc = async (req, res) => {
  try {
    const id = req.params.id;

    // kiểm tra id
    const product = mongoose.isValidObjectId(id)
      ? await BaiviettintucModel.findById(id)
      : await BaiviettintucModel.findOne({ slug: id });

    if (!product) {
      return res.status(404).send("Không tìm thấy bài viết");
    }

    const category = await Menu_tintucModel.findById(product.menutintuc_id);

    const baiviet = await BaiviettintucModel.find({
      menutintuc_id: product.menutintuc_id,
      nhap: true,
    }).sort({ _id: -1 });

    res.render("./site/product_tintuc", { product, baiviet, category });
  } catch (err) {
    console.error("❌ Lỗi tại productTinTuc:", err);
    res.status(500).send("Có lỗi xảy ra");
  }
};

const danhsachvideo = async (req, res) => {
    const baiviet = await BaivietdichvuModel.find({nhap: true});
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = page * limit - limit;
    const totalRows = await VideoModel.find().countDocuments();
    const totalPages = Math.ceil(totalRows / limit)
    const product = await VideoModel
        .find({})
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    const next = page + 1;
    const hasNext = page < totalPages ? true : false;
    const prev = page - 1;
    const hasPrev = page > 1 ? true : false;
    res.render("./site/danhsachvideo", {
        product,
        page,
        totalPages,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages),
        baiviet
    });
}
const productvideo = async (req, res) => {
    const id = req.params.id;
    const baiviet = await Product_sanphamModel.find({nhap: true});
    const product = await VideoModel.findById(id);
    res.render("./site/product_video", { product, baiviet });
}
const gioithieu = async (req, res) => {
    const chiase = await ChiaseModel.find();
    const product = await Gioi_thieu_trangModel.find();
    res.render("./site/gioithieu", { product, chiase });
}
const lienhe = async (req, res) => {
    const thongtin = await Thong_tin_trangModel.find();
    res.render("./site/lienhe", { thongtin });
}
// const productsp = async (req, res) => {
//     const id = req.params.id;
//     const product = await Product_sanphamModel.findById(id).populate({ path: "nhomsp_id" });
//     const category_danhmuc = await Menu_danhmuc_sanphamModel.findById(product.nhomsp_id.danhmuc_id);
//     const product_noibat = await Product_sanphamModel.find({nhap: true}).limit(5).sort({ _id: -1 });
//     res.render("./site/product", { product, category_danhmuc, product_noibat, });
// }
const productsp = async (req, res) => {
  try {
    const id = req.params.id;

    // Tìm sản phẩm + populate nhóm sản phẩm
    const product = await Product_sanphamModel.findById(id).populate("nhomsp_id");

    if (!product) {
      return res.status(404).send("Không tìm thấy sản phẩm");
    }

    // Kiểm tra nhomsp_id tồn tại
    if (!product.nhomsp_id) {
      return res.status(400).send("Sản phẩm chưa gán nhóm sản phẩm");
    }

    // Kiểm tra danhmuc_id tồn tại
    let category_danhmuc = null;
    if (product.nhomsp_id.danhmuc_id) {
      category_danhmuc = await Menu_danhmuc_sanphamModel.findById(product.nhomsp_id.danhmuc_id);
    }

    // Lấy sản phẩm nổi bật
    const product_noibat = await Product_sanphamModel.find({ nhap: true })
      .limit(5)
      .sort({ _id: -1 });

    res.render("./site/product", {
      product,
      category_danhmuc,
      product_noibat,
    });
  } catch (err) {
    console.error("❌ Lỗi tại productsp:", err);
    res.status(500).send("Có lỗi xảy ra khi load sản phẩm");
  }
};

const thuocloban = async (req, res) => {
    const product = await LobanModel.find();
    res.render("./site/thuoc-lo-ban", {product});
}
const success = async (req, res) => {
    res.render("./site/success");
}
const tuvan = async (req, res) => {
    res.render("./site/tuvan");
}
const guilienhe = async (req, res) => {
    const body = req.body;
    const lienhe = {
        name: body.name || " ",
        lienhe: body.lienhe || " ",
        email: body.email || " ",
        diachi: body.diachi || " ",
        loaicongtrinh: body.loaicongtrinh || " ",
        mucdautu: body.mucdautu || " ",
        img: body.img || " ",
        yeucau: body.yeucau || " ",
        trangthai: false,
    }
    new TuvanModel(lienhe).save();
    res.redirect("/success");
}
const search = async (req, res) => {
    const keyword = req.query.keyword || "";
    const products = await Product_sanphamModel
        .find({
            $text: {
                $search: keyword,
            }, nhap: true
        })
        .sort({ _id: -1 })

    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = page * limit - limit;
    const totalRows = products.length;
    const totalPages = Math.ceil(totalRows / limit);
    const next = page + 1;
    const hasNext = page < totalPages ? true : false;
    const prev = page - 1;
    const hasPrev = page > 1 ? true : false;
    const product = [];
    if (skip <= totalRows) {
        if (limit * page <= totalRows) {
            for (var i = skip; i < limit * page; i++) {
                product.push(products[i])
            }
        }
        else {
            for (var i = skip; i < skip + totalRows % limit; i++) {
                product.push(products[i])
            }
        }
    }
    res.render("./site/search", {
        products, keyword, product,
        page,
        totalPages,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages),
    });
}

module.exports = {
    home,
    categoryDanhmuc,
    categoryitem,
    categorydichvu,
    categoryitintuc,
    danhsachvideo,
    gioithieu,
    lienhe,
    productTinTuc,
    productsp,
    productdichvu,
    success,
    thuocloban,
    tuvan,
    productvideo,
    guilienhe,
    search,

}


