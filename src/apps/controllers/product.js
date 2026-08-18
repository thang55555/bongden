
const pagination = require("../../common/pagination");
const slug = require("slug");
const fs = require("fs");
const path = require("path");
const Gioi_thieu_trangModel = require("../models/gioi_thieu_trang");
const Thong_tin_trangModel = require("../models/thong_tin_trang");
const Menu_danhmuc_sanphamModel = require("../models/menu_danhmuc_sanpham");
const Menu_nhom_sanphamModel = require("../models/menu_nhom_sanpham");
const Anh_nhom_san_phamModel = require("../models/anh_nhom_san_pham");
const Product_sanphamModel = require("../models/product_sanpham");
const Menu_tintucModel = require("../models/menu_tintuc");
const BaiviettintucModel = require("../models/baiviet_tintuc");
const Menu_dichvuModel = require("../models/menu_dichvu");
const BaivietdichvuModel = require("../models/baiviet_dichvu");
const TuvanModel = require("../models/tuvan");
const ChiaseModel = require("../models/chiase");
const VideoModel = require("../models/video");
const LobanModel = require("../models/loban");
const ImagesModel = require("../models/images");
const BannerModel = require("../models/banner");
const OrderModel = require("../models/order");




// nam thành phát


const upload = (req, res) => {
    // fs.renameSync(files.upload.path, path.resolve("src/public/images", files.upload.originalFilename));
    // const newPath = path.resolve("src/public/images", files.upload.originalFilename);
    // let funcNum = req.query.CKEditorFuncNum;                 
    // let msg = 'Upload successfully';
    // res.status(201).send("<script>window.parent.CKEDITOR.tools.callFunction('"+funcNum+"','"+newPath+"','"+msg+"');</script>");


    try {
        fs.readFile(req.files.upload.path, function (err, data) {
            var newPath = path.resolve("public/images", req.files.upload.originalFilename);
            fs.writeFile(newPath, data, function (err) {
                if (err) console.log({ err: err });
                else {
                    console.log(req.files.upload.originalFilename);
                    //     imgl = '/images/req.files.upload.originalFilename';
                    //     let img = "<script>window.parent.CKEDITOR.tools.callFunction('','"+imgl+"','ok');</script>";
                    //    res.status(201).send(img);

                    let fileName = req.files.upload.originalFilename;
                    let url = '/images/' + fileName;
                    let msg = 'Upload successfully';
                    const add = {
                        images: fileName,
                        note: "01"
                    }
                    new ImagesModel(add).save();

                    let funcNum = req.query.CKEditorFuncNum;

                    res.send("<script>window.parent.CKEDITOR.tools.callFunction('" + funcNum + "','" + url + "','Upload thành công');</script>");
                }
            });
        });
    } catch (error) {
        console.log(error.message);
    }

}

const list = async (req, res) => {
    const tieude = await ImagesModel.aggregate([
        { $match: { note: "02" } },
        {
            $group: {
                _id: "$images",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { _id: -1 } }
    ]);

    const content = await ImagesModel.aggregate([
        { $match: { note: "01" } },
        {
            $group: {
                _id: "$images",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { _id: -1 } }
    ]);

    res.render("./admin/image-browser", {
        tieudeJson: JSON.stringify(tieude), contentJson: JSON.stringify(content)
    });

}



const gioithieutrang = async (req, res) => {
    const gioithieu = await Gioi_thieu_trangModel.find();
    res.render("./admin/thong-tin-trang/gioi-thieu-trang", { gioithieu })
}
const editgioithieutrang = async (req, res) => {
    const id = req.params.id;
    const gioithieu = await Gioi_thieu_trangModel.findById(id);
    res.render("./admin/thong-tin-trang/edit-gioi-thieu-trang", { gioithieu })
}
const updategioithieu = async (req, res) => {
    try {
        const id = req.params.id;
        const { files, body } = req;


        const update = {
            linkvideo: body.linkvideo,
            gioithieuchung: body.gioithieuchung,
            content_tamnhin: body.content_tamnhin,
            content_sumenh: body.content_sumenh,
            content_cotloi: body.content_cotloi,
            content_kythuat: body.content_kythuat,
        };

        // ========= XỬ LÝ ẢNH TẦM NHÌN =========
        if (files.img_tamnhin && files.img_tamnhin[0]) {
            const file = files.img_tamnhin[0];

            update.img_tamnhin = file.originalname;

            fs.renameSync(
                file.path,
                path.resolve("src/public/site/images/update", file.originalname)
            );

            new ImagesModel({
                images: file.originalname,
                note: "02",
            }).save();
        }

        // ========= XỬ LÝ ẢNH CỐT LÕI =========
        if (files.img_cotloi && files.img_cotloi[0]) {
            const file = files.img_cotloi[0];

            update.img_cotloi = file.originalname;

            fs.renameSync(
                file.path,
                path.resolve("src/public/site/images/update", file.originalname)
            );

            new ImagesModel({
                images: file.originalname,
                note: "02",
            }).save();
        }

        // ========= XỬ LÝ ẢNH KỸ THUẬT =========
        if (files.img_kythuat && files.img_kythuat[0]) {
            const file = files.img_kythuat[0];

            update.img_kythuat = file.originalname;

            fs.renameSync(
                file.path,
                path.resolve("src/public/site/images/update", file.originalname)
            );

            new ImagesModel({
                images: file.originalname,
                note: "02",
            }).save();
        }

        // Cập nhật database
        await Gioi_thieu_trangModel.updateOne({ _id: id }, { $set: update });

        res.redirect("/admin/gioi-thieu-trang");
    } catch (err) {
        console.log(err);
        res.send("Có lỗi xảy ra");
    }
};




const thongtintrang = async (req, res) => {
    const thongtintrang = await Thong_tin_trangModel.find();
    res.render("./admin/thong-tin-trang/thong-tin-trang", { thongtintrang })
}
const editthongtintrang = async (req, res) => {
    const id = req.params.id;
    const thongtin = await Thong_tin_trangModel.findById(id);
    res.render("./admin/thong-tin-trang/edit-thong-tin-trang", { thongtin })
}
const updatethongtintrang = async (req, res) => {
    try {
        const id = req.params.id;
        const { files, body } = req;

        const update = {
            sdt: body.sdt,
            email: body.email,
            name: body.name,
            diachi: body.diachi,
            mst: body.mst,
            content: body.content,
            fb: body.fb,
            yt: body.yt,
            zalo: body.zalo,
            title: body.title,
            description: body.description,
            keywords: body.keywords,
            gioithieu: body.gioithieu,
        };

        if (files && files.length > 0) {
            for (const file of files) {
                // Kiểm tra loại file dựa theo mimetype
                if (file.mimetype.startsWith("image/")) {
                    update["images"] = file.originalname;

                    // Lưu vào bảng ImagesModel nếu muốn
                    await new ImagesModel({
                        images: file.originalname,
                        note: "02",
                    }).save();
                } else if (file.mimetype.startsWith("video/")) {
                    update["video"] = file.originalname;
                }

                // Di chuyển file vào thư mục đích
                const destPath = path.resolve("src/public/site/images/update", file.originalname);
                fs.renameSync(file.path, destPath);
            }
        }

        // Cập nhật dữ liệu trong MongoDB
        await Thong_tin_trangModel.updateOne({ _id: id }, { $set: update });

        res.redirect("/admin/thong-tin-trang");
    } catch (err) {
        console.error("Lỗi khi cập nhật thông tin trang:", err);
        res.status(500).send("Có lỗi xảy ra khi cập nhật thông tin trang.");
    }
};



const danhmucsanpham = async (req, res) => {
    const danhmuc = await Menu_danhmuc_sanphamModel.find().sort({ _id: -1 });
    const stt = 1;
    res.render("./admin/menu-danh-muc/danh-sach-menu-danh-muc", { danhmuc, stt })
}
const adddanhmucsanpham = async (req, res) => {
    res.render("./admin/menu-danh-muc/add-menu-danh-muc", { data: {} })
}
const adddanhmuc = async (req, res) => {
    const { body, files } = req;
    const sosanh = await Menu_danhmuc_sanphamModel.find({ name: body.name });
    if (sosanh.length < 1) {
        const add = {
            name: body.name,
            slug: slug(body.name),
            content: body.content,
            title: body.title,
            description: body.description,
            keywords: body.keywords,
            icon: body.icon
        }
        if (files && files.length > 0) {
            for (const file of files) {
                // Kiểm tra loại file dựa theo mimetype
                if (file.mimetype.startsWith("image/")) {
                    add["images"] = file.originalname;

                    // Lưu vào bảng ImagesModel nếu muốn
                    await new ImagesModel({
                        images: file.originalname,
                        note: "02",
                    }).save();
                } else if (file.mimetype.startsWith("video/")) {
                    add["video"] = file.originalname;
                }

                // Di chuyển file vào thư mục đích
                const destPath = path.resolve("src/public/site/images/update", file.originalname);
                fs.renameSync(file.path, destPath);
            }
        }
        new Menu_danhmuc_sanphamModel(add).save();
        res.redirect("/admin/danh-muc-san-pham")
    }
    else {
        res.render("./admin/menu-danh-muc/add-menu-danh-muc", { data: { error: "Danh mục đã tồn tại" } })
    }

}
const editdanhmucsanpham = async (req, res) => {
    const id = req.params.id;
    const danhmuc = await Menu_danhmuc_sanphamModel.findById(id);
    res.render("./admin/menu-danh-muc/edit-menu-danh-muc", { danhmuc })
}
const updatedanhmuc = async (req, res) => {
    const id = req.params.id;
    const { body, files } = req;
    const danhmuc = {
        name: body.name,
        slug: slug(body.name),
        content: body.content,
        title: body.title,
        description: body.description,
        keywords: body.keywords,
        icon: body.icon
    }
    if (files && files.length > 0) {
        for (const file of files) {
            // Kiểm tra loại file dựa theo mimetype
            if (file.mimetype.startsWith("image/")) {
                danhmuc["images"] = file.originalname;

                // Lưu vào bảng ImagesModel nếu muốn
                await new ImagesModel({
                    images: file.originalname,
                    note: "02",
                }).save();
            } else if (file.mimetype.startsWith("video/")) {
                danhmuc["video"] = file.originalname;
            }

            // Di chuyển file vào thư mục đích
            const destPath = path.resolve("src/public/site/images/update", file.originalname);
            fs.renameSync(file.path, destPath);
        }
    }
    await Menu_danhmuc_sanphamModel.updateOne({ _id: id }, { $set: danhmuc });
    res.redirect("/admin/danh-muc-san-pham");
}
const deletedanhmucsanpham = async (req, res) => {
    const id = req.params.id;
    const delnhom = await Menu_nhom_sanphamModel.find({ danhmuc_id: id })
    for (item of delnhom) {
        await Menu_nhom_sanphamModel.deleteOne({ _id: item._id });
        const delproduct = await Product_sanphamModel.find({ nhomsp_id: item._id });
        for (item2 of delproduct) {
            await Product_sanphamModel.deleteOne({ _id: item2._id });
        }
    }

    await Menu_danhmuc_sanphamModel.deleteOne({ _id: id });
    res.redirect("/admin/danh-muc-san-pham")
}






const nhomsanpham = async (req, res) => {
    const nhomsanpham = await Menu_nhom_sanphamModel
        .find()
        .populate({ path: "danhmuc_id" })
        .sort({ _id: -1 });
    const stt = 1;
    res.render("./admin/nhom-san-pham/danh-sach-nhom-san-pham", { nhomsanpham, stt })
}
const addnhomsanpham = async (req, res) => {
    const danhmuc = await Menu_danhmuc_sanphamModel.find()
    res.render("./admin/nhom-san-pham/add-nhom-san-pham", { data: {}, danhmuc })
}
const addnhomsp = async (req, res) => {
    const danhmuc = await Menu_danhmuc_sanphamModel.find()
    const { body, files } = req;
    const sosanh = await Menu_nhom_sanphamModel.find({ name: body.name });
    if (sosanh.length < 1) {
        const add = {
            danhmuc_id: body.danhmuc_id,
            name: body.name,
            slug: slug(body.name),
            content: body.content,
            title: body.title,
            description: body.description,
            keywords: body.keywords,
        }
        if (files && files.length > 0) {
            for (const file of files) {
                // Kiểm tra loại file dựa theo mimetype
                if (file.mimetype.startsWith("image/")) {
                    add["images"] = file.originalname;

                    // Lưu vào bảng ImagesModel nếu muốn
                    await new ImagesModel({
                        images: file.originalname,
                        note: "02",
                    }).save();
                } else if (file.mimetype.startsWith("video/")) {
                    add["video"] = file.originalname;
                }

                // Di chuyển file vào thư mục đích
                const destPath = path.resolve("src/public/site/images/update", file.originalname);
                fs.renameSync(file.path, destPath);
            }
        }
        new Menu_nhom_sanphamModel(add).save();
        res.redirect("/admin/nhom-san-pham");
    }
    else {
        res.render("./admin/nhom-san-pham/add-nhom-san-pham", { data: { error: "Nhóm sản phẩm đã tồn tại" }, danhmuc })
    }

}
const editnhomsanpham = async (req, res) => {
    const id = req.params.id;
    const editnhom = await Menu_nhom_sanphamModel.findById(id);
    const danhmuc = await Menu_danhmuc_sanphamModel.find();
    res.render("./admin/nhom-san-pham/edit-nhom-san-pham", { editnhom, danhmuc })
}
const updatenhomsanpham = async (req, res) => {
    const id = req.params.id;
    const { body, files } = req;
    const update = {
        danhmuc_id: body.danhmuc_id,
        name: body.name,
        slug: slug(body.name),
        content: body.content,
        title: body.title,
        description: body.description,
        keywords: body.keywords,
    };
    if (files && files.length > 0) {
        for (const file of files) {
            // Kiểm tra loại file dựa theo mimetype
            if (file.mimetype.startsWith("image/")) {
                update["images"] = file.originalname;

                // Lưu vào bảng ImagesModel nếu muốn
                await new ImagesModel({
                    images: file.originalname,
                    note: "02",
                }).save();
            } else if (file.mimetype.startsWith("video/")) {
                update["video"] = file.originalname;
            }

            // Di chuyển file vào thư mục đích
            const destPath = path.resolve("src/public/site/images/update", file.originalname);
            fs.renameSync(file.path, destPath);
        }
    }
    await Menu_nhom_sanphamModel.updateOne({ _id: id }, { $set: update });
    res.redirect("/admin/nhom-san-pham")
}
const deletenhomsanpham = async (req, res) => {
    const id = req.params.id;

    const delproduct = await Product_sanphamModel.find({ nhomsp_id: id });
    for (item2 of delproduct) {
        await Product_sanphamModel.deleteOne({ _id: item2._id });
    }
    const delimg = await Anh_nhom_san_phamModel.find({ anhnhom_id: id })
    for (item2 of delimg) {
        await Anh_nhom_san_phamModel.deleteOne({ _id: item2._id });
    }

    await Menu_nhom_sanphamModel.deleteOne({ _id: id });
    res.redirect("/admin/nhom-san-pham")
}

const pushanhnhomsanpham = async (req, res) => {
    const id = req.params.id;
    const push = await Menu_nhom_sanphamModel.findById(id);
    res.render("./admin/nhom-san-pham/push-img-danh-muc-sp", { push })
}
const pushanh = async (req, res) => {
    const id = req.params.id;
    const { file, body } = req;
    if (file) {
        fs.renameSync(file.path, path.resolve("src/public/site/images/update", file.originalname));
        const image = {
            anhnhom_id: id,
            images: file.originalname,
            content: body.content,
        }
        new Anh_nhom_san_phamModel(image).save();
        const add = {
            images: file.originalname,
            note: "02"
        };
        new ImagesModel(add).save();
    }
    res.redirect("/admin/nhom-san-pham")
}


const anhnhomsanpham = async (req, res) => {
    const id = req.params.id;
    const anhnhom = await Anh_nhom_san_phamModel.find({ anhnhom_id: id }).sort({ _id: -1 });
    const tieude = await Menu_nhom_sanphamModel.findById(id);
    const stt = 1;
    res.render("./admin/nhom-san-pham/danh-sach-anh-nhom-san-pham", { anhnhom, tieude, stt })
}
const editanhnhomsanpham = async (req, res) => {
    const id = req.params.id;
    const editanh = await Anh_nhom_san_phamModel.findById(id);
    const tieude = await Menu_nhom_sanphamModel.findById(editanh.anhnhom_id);
    const danhmuc = await Menu_nhom_sanphamModel.find();
    res.render("./admin/nhom-san-pham/edit-anh-nhom-san-pham", { editanh, tieude, danhmuc })
}
const uploadanhnhomsanpham = async (req, res) => {
    const id = req.params.id;
    const { file, body } = req;
    const update = {
        anhnhom_id: body.tennhomsanpham_id,
        content: body.content,
    }
    if (file) {
        const images = file.originalname;
        fs.renameSync(file.path, path.resolve("src/public/site/images/update", file.originalname));
        update["images"] = images;
        const add = {
            images: file.originalname,
            note: "02"
        };
        new ImagesModel(add).save();
    }
    await Anh_nhom_san_phamModel.updateOne({ _id: id }, { $set: update });
    res.redirect(`/admin/anh-nhom-san-pham/${body.tennhomsanpham_id}`);
}
const deleteanhnhomsanpham = async (req, res) => {
    const id = req.params.id;
    await Anh_nhom_san_phamModel.deleteOne({ _id: id });
    res.redirect("/admin/nhom-san-pham")
}


const danhsachsanpham = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = page * limit - limit;
    const totalRows = await Product_sanphamModel.find().countDocuments();
    const totalPages = Math.ceil(totalRows / limit)
    const product = await Product_sanphamModel
        .find()
        .sort({ _id: -1 })
        .populate({ path: "nhomsp_id" })
        .skip(skip)
        .limit(limit);
    const next = page + 1;
    const hasNext = page < totalPages ? true : false;
    const prev = page - 1;
    const hasPrev = page > 1 ? true : false;
    const stt = 1;

    res.render("./admin/danh-sach-san-pham/danh-sach-san-pham", {
        product, stt,
        page,
        totalPages,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages),
    })
}
const addsanpham = async (req, res) => {
    const danhmuc = await Menu_nhom_sanphamModel.find();
    const dichvu = await Menu_dichvuModel.find();
    const tieude = await ImagesModel.aggregate([
        { $match: { note: "02" } },
        {
            $group: {
                _id: "$images",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { _id: -1 } },
    ]);

    const content = await ImagesModel.aggregate([
        { $match: { note: "01" } },
        {
            $group: {
                _id: "$images",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } },

        { $sort: { _id: -1 } },
    ]);

    res.render("./admin/danh-sach-san-pham/add-san-pham", { danhmuc, dichvu, tieudeJson: JSON.stringify(tieude), contentJson: JSON.stringify(content) })
}

const addproduct = async (req, res) => {
    const { files, body } = req;
    let congsuatArray = [];

    if (body.congsuat) {
        congsuatArray = body.congsuat
            .split(',')                  // Cắt chuỗi thành mảng theo dấu phẩy -> ["10w", " 20w", ...]
            .map(item => item.trim())    // Xóa khoảng trắng thừa ở đầu/cuối mỗi phần tử -> ["10w", "20w", ...]
            .filter(item => item !== '');// Lọc bỏ các phần tử rỗng (nếu có)
    }
    const products = {
        nhomsp_id: body.danhmuc_id || " ",
        name: body.name || " ",
        slug: slug(body.name) || " ",
        sku: body.sku || " ",
        price: body.price || " ",
        sale: body.sale || " ",
        content: body.content || " ",
        anhsang: body.anhsang || " ",
        congsuat: congsuatArray || " ",
        title: body.title || " ",
        description: body.description || " ",
        keywords: body.keywords || " ",
        noibat: body.noibat || " ",
        thongso: body.thongso || " ",
        mota: body.mota || " ",
        huongdan: body.huongdan || " ",
        baohanh: body.baohanh || " ",
        nhap: body.nhap == "on",
    };

    // 1. Khởi tạo mảng chứa tất cả ảnh (cả upload và album)
    let allImages = [];

    // 2. Xử lý file upload (nếu có)
    if (files && files.length > 0) {
        for (const item of files) {
            // Rename file từ tmp sang thư mục chính
            fs.renameSync(item.path, path.resolve("src/public/site/images/update", item.originalname));

            // Lưu vào DB ImagesModel
            await new ImagesModel({
                images: item.originalname,
                note: "02"
            }).save();

            // Thêm tên file vào mảng tổng
            allImages.push(item.originalname);
        }
    }

    // 3. Xử lý ảnh từ Album (nếu có)
    if (body.album_image_ids) {
        // Chuyển chuỗi "anh1.jpg,anh2.png" thành mảng ["anh1.jpg", "anh2.png"]
        const albumFiles = body.album_image_ids.split(',');
        allImages = allImages.concat(albumFiles);
    }

    // 4. Tạo mảng định dạng {stt, images} để gán vào sản phẩm
    products["image"] = allImages.map((imgName, index) => ({
        stt: index,
        images: imgName
    }));
    new Product_sanphamModel(products).save();
    res.redirect("/admin/danh-sach-san-pham");

}


const editsanpham = async (req, res) => {
    const id = req.params.id;
    const page = req.query.page;
    const danhmuc = await Menu_nhom_sanphamModel.find();
    const product = await Product_sanphamModel.findById(id);
    const dichvu = await Menu_dichvuModel.find();
    const tieude = await ImagesModel.aggregate([
        { $match: { note: "02" } },
        {
            $group: {
                _id: "$images",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { _id: -1 } },
    ]);

    const content = await ImagesModel.aggregate([
        { $match: { note: "01" } },
        {
            $group: {
                _id: "$images",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } },

        { $sort: { _id: -1 } },
    ]);

    res.render("./admin/danh-sach-san-pham/edit-san-pham", { danhmuc, product, dichvu, page, tieudeJson: JSON.stringify(tieude), contentJson: JSON.stringify(content) })
}

const uploadsanpham = async (req, res) => {
    const id = req.params.id;
    const { files, body } = req;
    let congsuatArray = [];

    if (body.congsuat) {
        congsuatArray = body.congsuat
            .split(',')                  // Cắt chuỗi thành mảng theo dấu phẩy -> ["10w", " 20w", ...]
            .map(item => item.trim())    // Xóa khoảng trắng thừa ở đầu/cuối mỗi phần tử -> ["10w", "20w", ...]
            .filter(item => item !== '');// Lọc bỏ các phần tử rỗng (nếu có)
    }
    const products = {
        nhomsp_id: body.danhmuc_id,
        name: body.name,
        slug: slug(body.name),
        sku: body.sku,
        price: body.price,
        sale: body.sale,
        content: body.content,
        anhsang: body.anhsang,
        congsuat: congsuatArray,
        title: body.title,
        description: body.description,
        keywords: body.keywords,
        noibat: body.noibat,
        thongso: body.thongso,
        mota: body.mota,
        huongdan: body.huongdan,
        baohanh: body.baohanh,
        nhap: body.nhap == "on",
    };

    // 1. Khởi tạo mảng chứa tất cả ảnh (cả upload và album)
    if (files && files.length > 0 || body.album_image_ids && body.album_image_ids.length > 0) {
        let allImages = [];

        // 2. Xử lý file upload (nếu có)
        if (files && files.length > 0) {
            for (const item of files) {
                // Rename file từ tmp sang thư mục chính
                fs.renameSync(item.path, path.resolve("src/public/site/images/update", item.originalname));

                // Lưu vào DB ImagesModel
                await new ImagesModel({
                    images: item.originalname,
                    note: "02"
                }).save();

                // Thêm tên file vào mảng tổng
                allImages.push(item.originalname);
            }
        }

        // 3. Xử lý ảnh từ Album (nếu có)
        if (body.album_image_ids) {
            // Chuyển chuỗi "anh1.jpg,anh2.png" thành mảng ["anh1.jpg", "anh2.png"]
            const albumFiles = body.album_image_ids.split(',');
            allImages = allImages.concat(albumFiles);
        }

        // 4. Tạo mảng định dạng {stt, images} để gán vào sản phẩm
        products["image"] = allImages.map((imgName, index) => ({
            stt: index,
            images: imgName
        }));
    }

    await Product_sanphamModel.updateOne({ _id: id }, { $set: products });
    res.redirect('/admin/danh-sach-san-pham?page=' + req.query.page);
}



const uploadsanpham2 = async (req, res) => {
    const id = req.params.id;
    const product = await Product_sanphamModel.findById(id);
    if (product.nhap == true) {
        const products = {
            nhap: false
        }
        await Product_sanphamModel.updateOne({ _id: id }, { $set: products });
    }
    else {
        const products = {
            nhap: true
        }
        await Product_sanphamModel.updateOne({ _id: id }, { $set: products });
    }
    res.redirect('/admin/danh-sach-san-pham?page=' + req.query.page);
}

const deletesanpham = async (req, res) => {
    const id = req.params.id;
    await Product_sanphamModel.deleteOne({ _id: id });
    res.redirect('/admin/danh-sach-san-pham?page=' + req.query.page);
}



const menutintuc = async (req, res) => {
    const category_tintuc = await Menu_tintucModel.find().sort({ _id: -1 });
    const stt = 1;
    res.render("./admin/menu-tin-tuc/danh-sach-menu-tin-tuc", { category_tintuc, stt })
}
const addmenutintuc = async (req, res) => {
    res.render("./admin/menu-tin-tuc/add-menu-tin-tuc", { data: {} })
}
const addcategorytintuc = async (req, res) => {
    const body = req.body;
    const sosanh = await Menu_tintucModel.find({ name: body.name });
    if (sosanh.length < 1) {
        const addcategory = {
            name: body.name,
            slug: slug(body.name),
            title: body.title,
            description: body.description,
            keywords: body.keywords,
        }
        new Menu_tintucModel(addcategory).save();
        res.redirect("/admin/danh-sach-menu-tin-tuc")
    }
    else {
        res.render("./admin/menu-tin-tuc/add-menu-tin-tuc", { data: { error: "Menu đã tồn tại" } })
    }
}
const editmenutintuc = async (req, res) => {
    const id = req.params.id;
    const update = await Menu_tintucModel.findById(id);
    res.render("./admin/menu-tin-tuc/edit-menu-tin-tuc", { update })
}
const updatemenutintuc = async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    const update = {
        name: body.name,
        slug: slug(body.name),
        title: body.title,
        description: body.description,
        keywords: body.keywords,
    }
    await Menu_tintucModel.updateOne({ _id: id }, { $set: update });
    res.redirect("/admin/danh-sach-menu-tin-tuc")
}
const deletemenutintuc = async (req, res) => {
    const id = req.params.id;
    const delbaiviet = await BaiviettintucModel.find({ menutintuc_id: id })
    for (item2 of delbaiviet) {
        await BaiviettintucModel.deleteOne({ _id: item2._id });
    }

    await Menu_tintucModel.deleteOne({ _id: id });
    res.redirect("/admin/danh-sach-menu-tin-tuc")
}

const danhsachbaiviettintuc = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = page * limit - limit;
    const totalRows = await BaiviettintucModel.find().countDocuments();
    const totalPages = Math.ceil(totalRows / limit);
    const product_baiviettintuc = await BaiviettintucModel
        .find()
        .populate({ path: "menutintuc_id" })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    const next = page + 1;
    const hasNext = page < totalPages ? true : false;
    const prev = page - 1;
    const hasPrev = page > 1 ? true : false;
    const stt = 1;
    res.render("./admin/menu-tin-tuc/danh-sach-bai-viet-tin-tuc", {
        product_baiviettintuc, stt,
        page,
        totalPages,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages),
    })
}
const addbaiviettintuc = async (req, res) => {
    const category = await Menu_tintucModel.find();
    res.render("./admin/menu-tin-tuc/add-bai-viet-tin-tuc", { category })
}
const uploadbaiviettintuc = async (req, res) => {
    const { files, body } = req;
    const product = {
        menutintuc_id: body.menutintuc_id,
        name: body.name,
        slug: slug(body.name),
        content: body.content,
        title: body.title,
        description: body.description,
        keywords: body.keywords,
        nhap: body.nhap === "on"
    }
    if (files) {
        for (item of files) {
            const image = item.originalname;
            fs.renameSync(item.path, path.resolve("src/public/site/images/update", item.originalname));
            product["images"] = image;
            const add = {
                images: item.originalname,
                note: "02"
            };
            new ImagesModel(add).save();
        }
    }
    new BaiviettintucModel(product).save();
    res.redirect('/admin/danh-sach-bai-viet-tin-tuc?page=' + req.query.page)
}
const editbaiviettintuc = async (req, res) => {
    const id = req.params.id;
    const page = req.query.page;
    const product = await BaiviettintucModel.findById(id);
    const category = await Menu_tintucModel.find();
    res.render("./admin/menu-tin-tuc/edit-bai-viet-tin-tuc", { product, category, page })
}
const updatebaiviettintuc = async (req, res) => {
    const id = req.params.id;
    const { files, body } = req;
    const product = {
        menutintuc_id: body.menutintuc_id,
        name: body.name,
        slug: slug(body.name),
        content: body.content,
        title: body.title,
        description: body.description,
        keywords: body.keywords,
        nhap: body.nhap === "on"
    }
    if (files) {
        for (item of files) {
            const image = item.originalname;
            fs.renameSync(item.path, path.resolve("src/public/site/images/update", item.originalname));
            product["images"] = image;
            const add = {
                images: item.originalname,
                note: "02"
            };
            new ImagesModel(add).save();
        }
    }
    await BaiviettintucModel.updateOne({ _id: id }, { $set: product });
    res.redirect('/admin/danh-sach-bai-viet-tin-tuc?page=' + req.query.page)

}
const updatebaiviettintuc2 = async (req, res) => {
    const id = req.params.id;
    const product = await BaiviettintucModel.findById(id);
    if (product.nhap == true) {
        const products = {
            nhap: false
        }
        await BaiviettintucModel.updateOne({ _id: id }, { $set: products });
    }
    else {
        const products = {
            nhap: true
        }
        await BaiviettintucModel.updateOne({ _id: id }, { $set: products });
    }
    res.redirect('/admin/danh-sach-bai-viet-tin-tuc?page=' + req.query.page)
}
const deletebaiviettintuc = async (req, res) => {
    const id = req.params.id;
    await BaiviettintucModel.deleteOne({ _id: id });
    res.redirect('/admin/danh-sach-bai-viet-tin-tuc?page=' + req.query.page)
}




const menudichvu = async (req, res) => {
    const category = await Menu_dichvuModel.find().sort({ _id: -1 });
    const stt = 1;
    res.render("./admin/menu-dich-vu/danh-sach-menu-dich-vu", { category, stt })
}
const addmenudichvu = async (req, res) => {
    res.render("./admin/menu-dich-vu/add-menu-dich-vu", { data: {} });
}
const uploadmenudichvu = async (req, res) => {
    const { file, body } = req;
    const sosanh = await Menu_dichvuModel.find({ name: body.name });
    if (sosanh.length < 1) {
        const addcategory = {
            name: body.name,
            slug: slug(body.name),
            content: body.content,
            title: body.title,
            description: body.description,
            keywords: body.keywords,
        }
        if (file) {
            const images = file.originalname;
            fs.renameSync(file.path, path.resolve("src/public/site/images/update", file.originalname));
            addcategory["images"] = images;
            const add = {
                images: file.originalname,
                note: "02"
            };
            new ImagesModel(add).save();
        }
        new Menu_dichvuModel(addcategory).save();
        res.redirect("/admin/menu-dich-vu")
    }
    else {
        res.render("./admin/menu-dich-vu/add-menu-dich-vu", { data: { error: "Menu đã tồn tại" } })
    }
}
const editmenudichvu = async (req, res) => {
    const id = req.params.id;
    const category = await Menu_dichvuModel.findById(id);
    res.render("./admin/menu-dich-vu/edit-menu-dich-vu", { category })
}
const updatemenudichvu = async (req, res) => {
    const id = req.params.id;
    const { file, body } = req;
    const category = {
        name: body.name,
        slug: slug(body.name),
        content: body.content,
        title: body.title,
        description: body.description,
        keywords: body.keywords,
    }
    if (file) {
        const images = file.originalname;
        fs.renameSync(file.path, path.resolve("src/public/site/images/update", file.originalname));
        category["images"] = images;
        const add = {
            images: file.originalname,
            note: "02"
        };
        new ImagesModel(add).save();
    }
    await Menu_dichvuModel.updateOne({ _id: id }, { $set: category });
    res.redirect("/admin/menu-dich-vu")
}
const deletemenudichvu = async (req, res) => {
    const id = req.params.id;
    const delbaiviet = await BaivietdichvuModel.find({ menudichvu_id: id })
    for (item2 of delbaiviet) {
        await BaivietdichvuModel.deleteOne({ _id: item2._id });
    }
    await Menu_dichvuModel.deleteOne({ _id: id });
    res.redirect("/admin/menu-dich-vu")
}




const baivietdichvu = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = page * limit - limit;
    const totalRows = await BaivietdichvuModel.find().countDocuments();
    const totalPages = Math.ceil(totalRows / limit);
    const product = await BaivietdichvuModel
        .find()
        .populate({ path: "menudichvu_id" })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    const next = page + 1;
    const hasNext = page < totalPages ? true : false;
    const prev = page - 1;
    const hasPrev = page > 1 ? true : false;
    const stt = 1;
    res.render("./admin/menu-dich-vu/danh-sach-bai-viet-dich-vu", {
        product, stt,
        page,
        totalPages,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages),
    })
}
const addbaivietdichvu = async (req, res) => {
    const category = await Menu_dichvuModel.find();
    const tieude = await ImagesModel.aggregate([
        { $match: { note: "02" } },
        {
            $group: {
                _id: "$images",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { _id: -1 } },
    ]);

    const content = await ImagesModel.aggregate([
        { $match: { note: "01" } },
        {
            $group: {
                _id: "$images",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } },

        { $sort: { _id: -1 } },
    ]);

    res.render("./admin/menu-dich-vu/add-bai-viet-dich-vu", { category, tieudeJson: JSON.stringify(tieude), contentJson: JSON.stringify(content) })
}
const uploadbaivietdichvu = async (req, res) => {
    const { files, body } = req;
    const product = {
        menudichvu_id: body.menudichvu_id,
        name: body.name,
        slug: slug(body.name),
        content: body.content,
        title: body.title,
        description: body.description,
        keywords: body.keywords,
        nhap: body.nhap === "on",
        add: body.add,
    }
    // 1. Khởi tạo mảng chứa tất cả ảnh (cả upload và album)
    let allImages = [];

    // 2. Xử lý file upload (nếu có)
    if (files && files.length > 0) {
        for (const item of files) {
            // Rename file từ tmp sang thư mục chính
            fs.renameSync(item.path, path.resolve("src/public/site/images/update", item.originalname));

            // Lưu vào DB ImagesModel
            await new ImagesModel({
                images: item.originalname,
                note: "02"
            }).save();

            // Thêm tên file vào mảng tổng
            allImages.push(item.originalname);
        }
    }

    // 3. Xử lý ảnh từ Album (nếu có)
    if (body.album_image_ids) {
        // Chuyển chuỗi "anh1.jpg,anh2.png" thành mảng ["anh1.jpg", "anh2.png"]
        const albumFiles = body.album_image_ids.split(',');
        allImages = allImages.concat(albumFiles);
    }

    // 4. Tạo mảng định dạng {stt, images} để gán vào sản phẩm
    product["image"] = allImages.map((imgName, index) => ({
        stt: index,
        images: imgName
    }));

    new BaivietdichvuModel(product).save();
    res.redirect('/admin/bai-viet-dich-vu?page=' + req.query.page);

}
const editbaivietdichvu = async (req, res) => {
    const id = req.params.id;
    const page = req.query.page;
    const product = await BaivietdichvuModel.findById(id);
    const category = await Menu_dichvuModel.find();
    const tieude = await ImagesModel.aggregate([
        { $match: { note: "02" } },
        {
            $group: {
                _id: "$images",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { _id: -1 } },
    ]);

    const content = await ImagesModel.aggregate([
        { $match: { note: "01" } },
        {
            $group: {
                _id: "$images",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } },

        { $sort: { _id: -1 } },
    ]);
    res.render("./admin/menu-dich-vu/edit-bai-viet-dich-vu", { product, category, page, tieudeJson: JSON.stringify(tieude), contentJson: JSON.stringify(content) });
}
const updatebaivietdichvu = async (req, res) => {
    const id = req.params.id;
    const { files, body } = req;
    const product = {
        menudichvu_id: body.menudichvu_id,
        name: body.name,
        slug: slug(body.name),
        content: body.content,
        title: body.title,
        description: body.description,
        keywords: body.keywords,
        nhap: body.nhap === "on",
        add: body.add,
    }
    // 1. Khởi tạo mảng chứa tất cả ảnh (cả upload và album)
    if (files && files.length > 0 || body.album_image_ids && body.album_image_ids.length > 0) {
        let allImages = [];

        // 2. Xử lý file upload (nếu có)
        if (files && files.length > 0) {
            for (const item of files) {
                // Rename file từ tmp sang thư mục chính
                fs.renameSync(item.path, path.resolve("src/public/site/images/update", item.originalname));

                // Lưu vào DB ImagesModel
                await new ImagesModel({
                    images: item.originalname,
                    note: "02"
                }).save();

                // Thêm tên file vào mảng tổng
                allImages.push(item.originalname);
            }
        }

        // 3. Xử lý ảnh từ Album (nếu có)
        if (body.album_image_ids) {
            // Chuyển chuỗi "anh1.jpg,anh2.png" thành mảng ["anh1.jpg", "anh2.png"]
            const albumFiles = body.album_image_ids.split(',');
            allImages = allImages.concat(albumFiles);
        }

        // 4. Tạo mảng định dạng {stt, images} để gán vào sản phẩm
        product["image"] = allImages.map((imgName, index) => ({
            stt: index,
            images: imgName
        }));
    }
    await BaivietdichvuModel.updateOne({ _id: id }, { $set: product });
    res.redirect('/admin/bai-viet-dich-vu?page=' + req.query.page);
}

const updatebaivietdichvu2 = async (req, res) => {
    const id = req.params.id;
    const product = await BaivietdichvuModel.findById(id);
    if (product.nhap == true) {
        const products = {
            nhap: false
        }
        await BaivietdichvuModel.updateOne({ _id: id }, { $set: products });
    }
    else {
        const products = {
            nhap: true
        }
        await BaivietdichvuModel.updateOne({ _id: id }, { $set: products });
    }
    res.redirect('/admin/bai-viet-dich-vu?page=' + req.query.page);
}

const deletebaivietdichvu = async (req, res) => {
    const id = req.params.id;
    await BaivietdichvuModel.deleteOne({ _id: id });
    res.redirect('/admin/bai-viet-dich-vu?page=' + req.query.page);
}




const yeucautuvan = async (req, res) => {
    try {
        // Lấy số trang từ query (mặc định là trang 1 nếu không có)
        const stt = 1;
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Số lượng bản ghi hiển thị trên mỗi trang
        const skip = (page - 1) * limit;

        // Đếm tổng số lượng bản ghi có trong TuvanModel
        const totalDocs = await TuvanModel.countDocuments();

        // Tính tổng số trang
        const totalPages = Math.ceil(totalDocs / limit);

        // Lấy dữ liệu phân trang, sắp xếp mới nhất lên đầu
        const product = await TuvanModel.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        // Render ra view kèm theo dữ liệu phân trang
        res.render("./admin/tu-van/yeu-cau-tu-van", {
            product, stt,
            currentPage: page,
            totalPages: totalPages
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
}
const edityeucautuvan = async (req, res) => {
    const page = req.body.page || req.query.page || 1;
    const id = req.params.id;
    const product = {
        trangthai: req.body.trangthai == "true"
    }
    await TuvanModel.updateOne({ _id: id }, { $set: product });
    res.redirect(`/admin/danh-sach-yeu-cau-tu-van?page=${page}`);
}

const order = async (req, res) => {
    try {
        // Lấy số trang từ query (mặc định là trang 1 nếu không có)
        const stt = 1;
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Số lượng bản ghi hiển thị trên mỗi trang
        const skip = (page - 1) * limit;

        // Đếm tổng số lượng bản ghi có trong TuvanModel
        const totalDocs = await OrderModel.countDocuments();

        // Tính tổng số trang
        const totalPages = Math.ceil(totalDocs / limit);

        // Lấy dữ liệu phân trang, sắp xếp mới nhất lên đầu
        const product = await OrderModel.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        // Render ra view kèm theo dữ liệu phân trang
        res.render("./admin/order/order", {
            product, stt,
            currentPage: page,
            totalPages: totalPages
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
}
const editorder = async (req, res) => {
    const page = req.body.page || req.query.page || 1;
    const id = req.params.id;
    const product = {
        trangthai: req.body.trangthai == "true"
    }
    await OrderModel.updateOne({ _id: id }, { $set: product });
    res.redirect(`/admin/order?page=${page}`);
}


const chiasekhachhang = async (req, res) => {
    const product = await ChiaseModel.find().sort({ _id: -1 });
    const stt = 1;
    res.render("./admin/chia-se-khach-hang/danh-sach-chia-se-KH", { product, stt })
}
const addchiasekhachhang = async (req, res) => {
    res.render("./admin/chia-se-khach-hang/add-chia-se-kh")
}
const uploadchiasekhachhang = async (req, res) => {
    const { file, body } = req;
    const product = {
        name: body.name,
        content: body.content
    }
    if (file) {
        fs.renameSync(file.path, path.resolve("src/public/site/images/update", file.originalname));
        product["images"] = file.originalname;
        const add = {
            images: file.originalname,
            note: "02"
        };
        new ImagesModel(add).save();
    }
    new ChiaseModel(product).save();
    res.redirect("/admin/chia-se-khach-hang");
}
const editchiasekhachhang = async (req, res) => {
    const id = req.params.id;
    const product = await ChiaseModel.findById(id);
    res.render("./admin/chia-se-khach-hang/edit-chia-se-KH", { product })
}
const updatechiasekhachhang = async (req, res) => {
    const id = req.params.id;
    const { file, body } = req;
    const product = {
        name: body.name,
        content: body.content
    }
    if (file) {
        fs.renameSync(file.path, path.resolve("src/public/site/images/update", file.originalname));
        product["images"] = file.originalname;
        const add = {
            images: file.originalname,
            note: "02"
        };
        new ImagesModel(add).save();
    }
    await ChiaseModel.updateOne({ _id: id }, { $set: product });
    res.redirect("/admin/chia-se-khach-hang");
}
const deletechiasekhachhang = async (req, res) => {
    const id = req.params.id;
    await ChiaseModel.deleteOne({ _id: id });
    res.redirect("/admin/chia-se-khach-hang")
}


const video = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = page * limit - limit;
    const totalRows = await VideoModel.find().countDocuments();
    const totalPages = Math.ceil(totalRows / limit);
    const product = await VideoModel
        .find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    const next = page + 1;
    const hasNext = page < totalPages ? true : false;
    const prev = page - 1;
    const hasPrev = page > 1 ? true : false;
    const stt = 1;
    res.render("./admin/video/danh-sach-video", {
        product, stt,
        page,
        totalPages,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages)
    })
}
const addvideo = async (req, res) => {

    res.render("./admin/video/add-video")
}
const uploadvideo = async (req, res) => {
    const product = {
        tieude: req.body.tieude,
        content: req.body.content,
        slug: slug(req.body.tieude),
        linkvideo: req.body.linkvideo
    }
    new VideoModel(product).save();
    res.redirect("/admin/danh-sach-video")
}
const editvideo = async (req, res) => {
    const id = req.params.id;
    const product = await VideoModel.findById(id);
    res.render("./admin/video/edit-video", { product })
}
const updatevideo = async (req, res) => {
    const id = req.params.id;
    const product = {
        tieude: req.body.tieude,
        content: req.body.content,
        slug: slug(req.body.tieude),
        linkvideo: req.body.linkvideo
    }
    await VideoModel.updateOne({ _id: id }, { $set: product });
    res.redirect("/admin/danh-sach-video")
}
const deletevideo = async (req, res) => {
    const id = req.params.id;
    await VideoModel.deleteOne({ _id: id });
    res.redirect("/admin/danh-sach-video")
}
const search = async (req, res) => {
    const keyword = req.query.keyword || "";
    const products = await Product_sanphamModel
        .find({
            $text: {
                $search: keyword,
            }
        })
        .sort({ _id: -1 });

    const product = await BaivietdichvuModel
        .find({
            $text: {
                $search: keyword,
            }
        })
        .sort({ _id: -1 })
    const product2 = await BaiviettintucModel
        .find({
            $text: {
                $search: keyword,
            }
        })
        .sort({ _id: -1 })
    const total = products.length + product.length + product2.length
    res.render("./admin/search", { products, keyword, total, product, product2 })
}


const thuocloban = async (req, res) => {
    const product = await LobanModel.find();
    res.render("./admin/lo-ban/lo-ban", { product })
}
const editthuocloban = async (req, res) => {
    const id = req.params.id;
    const product = await LobanModel.findById(id);
    res.render("./admin/lo-ban/edit-lo-ban", { product })
}
const updatethuocloban = async (req, res) => {
    const id = req.params.id;
    const product = {
        metadescription: req.body.metadescription,
        content: req.body.content,
        metakeywords: req.body.metakeywords,
        title: req.body.title,

    }
    await LobanModel.updateOne({ _id: id }, { $set: product });
    res.redirect("/admin/thuoc-lo-ban")
}
//danh sách ảnh
const removeDuplicateImages = async () => {
    const duplicates = await ImagesModel.aggregate([
        {
            $group: {
                _id: {
                    note: "$note",
                    images: "$images"
                },
                ids: { $push: "$_id" },
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        }
    ]);

    for (const item of duplicates) {
        // Giữ lại document đầu tiên
        const idsToDelete = item.ids.slice(1);

        if (idsToDelete.length > 0) {
            await ImagesModel.deleteMany({
                _id: { $in: idsToDelete }
            });
        }
    }
};

const dsanh = async (req, res) => {

    // Xóa document trùng
    await removeDuplicateImages();

    const tieude = await ImagesModel.find({ note: "02" });

    const content = await ImagesModel.find({ note: "01" });

    res.render("./admin/danh-sach-anh/menu-danh-sach", {
        tieude,
        content
    });
};

const dsanhtieude = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    // Đếm tổng số document
    const total = await ImagesModel.countDocuments({ note: "02" });

    const totalPages = Math.ceil(total / limit);

    // Lấy dữ liệu theo trang
    const image = await ImagesModel.find({ note: "02" })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    res.render("./admin/danh-sach-anh/danh-sach-anh-tieu-de", {
        image,
        page,
        totalPages
    });
};
const dsanhconent = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    // Đếm tổng số document
    const total = await ImagesModel.countDocuments({ note: "01" });

    const totalPages = Math.ceil(total / limit);

    // Lấy dữ liệu theo trang
    const image = await ImagesModel.find({ note: "01" })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    res.render("./admin/danh-sach-anh/danh-sach-anh-content", {
        image,
        page,
        totalPages
    });
};


const banner = async (req, res) => {
    const product = await BannerModel.find().sort({ _id: -1 });
    const stt = 1;
    res.render("./admin/banner/danh-sach-banner", { product, stt })
}
const addbanner = async (req, res) => {
    res.render("./admin/banner/add-banner")
}
const uploadbanner = async (req, res) => {
    const { file, body } = req;
    const product = {
        name: body.name,
        content: body.content,
        title: body.title,
        metadescription: body.metadescription,
        metakeywords: body.metakeywords,
        content: body.content,
    }
    if (file) {
        fs.renameSync(file.path, path.resolve("src/public/site/images/update", file.originalname));
        product["images"] = file.originalname;
        const add = {
            images: file.originalname,
            note: "02"
        };
        new ImagesModel(add).save();
    }
    new BannerModel(product).save();
    res.redirect("/admin/banner");
}
const editbanner = async (req, res) => {
    const id = req.params.id;
    const product = await BannerModel.findById(id);
    res.render("./admin/banner/edit-banner", { product })
}
const updatebanner = async (req, res) => {
    const id = req.params.id;
    const { file, body } = req;
    const product = {
        name: body.name,
        content: body.content,
        title: body.title,
        metadescription: body.metadescription,
        metakeywords: body.metakeywords,
        content: body.content,
    }
    if (file) {
        fs.renameSync(file.path, path.resolve("src/public/site/images/update", file.originalname));
        product["images"] = file.originalname;
        const add = {
            images: file.originalname,
            note: "02"
        };
        new ImagesModel(add).save();
    }
    await BannerModel.updateOne({ _id: id }, { $set: product });
    res.redirect("/admin/banner");
}
const deletebanner = async (req, res) => {
    const id = req.params.id;
    await BannerModel.deleteOne({ _id: id });
    res.redirect("/admin/banner")
}
const hoadon = async (req, res) => {


    try {
        const hoaDonId = req.params.id;

        // Lấy dữ liệu hóa đơn tương ứng từ database (ví dụ từ TuvanModel hoặc OrderModel)
        const hoaDon = await OrderModel.findById(hoaDonId);
        const thongtintrang = await Thong_tin_trangModel.findOne();
        const stt = 1;
        const totalPrice = hoaDon.item.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const update = {
            hoadon: hoaDon.hoadon + 1 || 1
        }
        await OrderModel.updateOne({ _id: hoaDonId }, { $set: update });


        // Render ra file view hd.ejs và truyền dữ liệu sang
        res.render('./admin/hd', { hoaDon, thongtintrang, stt, totalPrice });
    } catch (error) {
        console.error(error);
        res.status(500).send("Không thể tải hóa đơn");
    }
}

const solanin = async (req, res) => {
    try {
        const id = req.params.id;
        // Dùng $inc của MongoDB để tự động cộng thêm 1 vào trường hoadon
        await OrderModel.updateOne({ _id: id }, { $inc: { hoadon: 1 } });
        res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
}

const donhang = async (req, res) => {
    try {
        const listCustomers = await OrderModel.find(); // Lấy danh sách khách hàng từ database
        const product = await Product_sanphamModel.find();
        // Tự động cập nhật ngày tháng năm hiện tại vào hóa đơn

        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1; // Tháng từ 0-11 nên phải +1
        const year = today.getFullYear();

        const dateString = `Ngày ${day < 10 ? '0' + day : day} tháng ${month < 10 ? '0' + month : month} năm ${year}`;



        res.render('./admin/order/hoa-don', { listCustomers, product, dateString }); // Truyền sang view với tên listCustomers
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
}
const adddonhang = async (req, res) => {
    try {
        const body = req.body;
        const items = [];
        let index = 1;

while (body[`product_name_${index}`]) {
    const productName = body[`product_name_${index}`];
    const cleanPrice = Number(body[`product_price_${index}`]?.replace(/\./g, '')) || 0;
    const cleanQty = Number(body[`product_qty_${index}`]?.replace(/\./g, '')) || 0;
    const cleanDiscount = Number(body[`product_discount_${index}`]?.replace(/\./g, '')) || 0;
    const productUnit = body[`product_unit_${index}`] || "";

    // 1. Push dữ liệu vào mảng `items` để lưu vào hóa đơn/đơn hàng
    items.push({
        name: productName,
        anhsang: "",
        thumbnail: " ",
        price: cleanPrice,
        qty: cleanQty,
        chietkhau: cleanDiscount,
        dvt: productUnit,
        sku: " "
    });

    // 2. Kiểm tra xem sản phẩm đã có trong kho/database sản phẩm chưa, chưa có thì thêm mới
    const existingProduct = await Product_sanphamModel.findOne({ name: productName });

    if (!existingProduct) {
        const newProductData = {
            nhomsp_id: [],
            name: productName,
            slug: slug(productName),
            sku: " ",
            price: cleanPrice,
            sale: cleanPrice,
            content: body.content || " ",
            anhsang: " ",
            congsuat: " ",
            title: " ",
            description: " ",
            keywords: " ",
            noibat: " ",
            thongso: " ",
            mota: " ",
            huongdan: " ",
            baohanh: " ",
            nhap: body.nhap == "on",
        };

        await new Product_sanphamModel(newProductData).save();
    }

    index++;
}


        const product = {
            madonhang: body.doc_no || " ",
            name: body.buyer_name || " ",
            sdt: body.sdt || " ",
            email: body.email || " ",
            namecty: body.name_cty || " ",
            tax: body.tax || " ",
            addcty: body.add_cty || " ",
            diachigiaohang: " ",
            diachigiao: body.address || " ",
            nvbh: body.salesperson || " ",
            note: body.content || " ",
            donvi: body.unit || "khách lẻ",
            dvt: "Hộp",
            chietkhau: "0",
            vanchuyen: " ",
            thanhtoan: " ",
            ship: Number(body.shipping_fee?.replace(/\./g, '')) || 0,
            item: items,
            trangthai: false,
        };
        const saveOrder = await new OrderModel(product).save();


        res.redirect('/admin/order',);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
}



module.exports = {

    upload, gioithieutrang, editgioithieutrang, updategioithieu, thongtintrang, editthongtintrang, updatethongtintrang,
    danhmucsanpham, adddanhmucsanpham, adddanhmuc, updatedanhmuc, editdanhmucsanpham, deletedanhmucsanpham,
    nhomsanpham, addnhomsanpham, addnhomsp, editnhomsanpham, updatenhomsanpham, deletenhomsanpham,
    anhnhomsanpham, editanhnhomsanpham, uploadanhnhomsanpham, pushanhnhomsanpham, pushanh, deleteanhnhomsanpham,
    danhsachsanpham, addsanpham, addproduct, editsanpham, uploadsanpham, deletesanpham,
    menutintuc, addmenutintuc, addcategorytintuc, deletemenutintuc, editmenutintuc, updatemenutintuc,
    danhsachbaiviettintuc, addbaiviettintuc, uploadbaiviettintuc, editbaiviettintuc, updatebaiviettintuc,
    deletebaiviettintuc, menudichvu, addmenudichvu, uploadmenudichvu, editmenudichvu, updatemenudichvu,
    deletemenudichvu, baivietdichvu, addbaivietdichvu, uploadbaivietdichvu, editbaivietdichvu, updatebaivietdichvu,
    deletebaivietdichvu, yeucautuvan, edityeucautuvan, chiasekhachhang, addchiasekhachhang, uploadchiasekhachhang,
    editchiasekhachhang, updatechiasekhachhang, deletechiasekhachhang, video, addvideo, uploadvideo, editvideo,
    updatevideo, deletevideo, search, uploadsanpham2, updatebaiviettintuc2, updatebaivietdichvu2,
    thuocloban, editthuocloban, updatethuocloban, dsanh, dsanhtieude, dsanhconent, list,
    banner, addbanner, uploadbanner, editbanner, updatebanner, deletebanner, order, editorder, hoadon, solanin, adddonhang, donhang
}