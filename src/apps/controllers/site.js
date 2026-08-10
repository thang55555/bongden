// src/apps/controllers/site.js
const ejs = require("ejs");
const path = require("path");
const fs = require('fs');
const transporter = require("../../common/transporter");
const slug = require("slug");
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
const BannerModel = require("../models/banner");
const ImagesModel = require("../models/images");
const OrderModel = require("../models/order");

// Helper: validate ObjectId or treat as slug
const findByIdOrSlug = async (Model, idOrSlug, slugField = "slug") => {
  if (mongoose.isValidObjectId(idOrSlug)) {
    return await Model.findById(idOrSlug);
  }
  return await Model.findOne({ [slugField]: idOrSlug });
};

// HOME
const home = async (req, res) => {
  const banner = await BannerModel.find();
  const duan = await BaivietdichvuModel.aggregate([
    { $sample: { size: 4 } } // Số 4 là số lượng bản ghi ngẫu nhiên bạn muốn lấy
  ]);
  const tintuc = await BaiviettintucModel.aggregate([
    { $sample: { size: 4 } } // Số 4 là số lượng bản ghi ngẫu nhiên bạn muốn lấy
  ]);
  const thongtintrang = await Thong_tin_trangModel.findOne();
  const seo ={
    title: thongtintrang.title,
    keywords: thongtintrang.keywords,
    description: thongtintrang.description
  }
  res.render("site/index", { banner, duan, tintuc, seo});

};

// GIOI THIEU
const gioithieu = async (req, res) => {
  try {
      const thongtintrang = await Thong_tin_trangModel.findOne();
  const seo ={
    title: thongtintrang.title,
    keywords: thongtintrang.keywords,
    description: thongtintrang.description
  }
    res.render("./site/gioithieu", {seo});
  } catch (err) {
    console.error("❌ Lỗi tại gioithieu:", err);
    res.redirect('/404');
  }
};

const category = async (req, res) => {
  try {
    const id = req.query.id;
    let check1 = null;
    let check2 = null;

    if (mongoose.isValidObjectId(id)) {
      check1 = await Menu_danhmuc_sanphamModel.findById(id);
      if (!check1) {
        check2 = await Menu_nhom_sanphamModel.findById(id);
      }
    }

    let menu;
    let filterQuery = { nhap: true };

    if (check1) {
      menu = check1;
      const product1 = await Menu_nhom_sanphamModel.find({ danhmuc_id: menu._id });
      const nhomIds = product1.map(item => item._id);
      filterQuery.nhomsp_id = { $in: nhomIds };
    } else if (check2) {
      menu = check2;
      filterQuery.nhomsp_id = { $in: [menu._id] };
    } else {
      menu = await Menu_danhmuc_sanphamModel.findOne();
      if (menu) {
        const product1 = await Menu_nhom_sanphamModel.find({ danhmuc_id: menu._id });
        const nhomIds = product1.map(item => item._id);
        filterQuery.nhomsp_id = { $in: nhomIds };
      }
    }

    // --- KIỂM TRA AN TOÀN: NẾU KHÔNG TÌM THẤY MENU NÀO TRONG DB ---
    if (!menu) {
      return res.status(404).send("Không tìm thấy danh mục sản phẩm.");
    }

    // --- 1. LẤY CÁC THAM SỐ TỪ URL ---
    const { maxPrice, power, colorTemp, limit = 12, page = 1, sort } = req.query;

    // --- 2. XỬ LÝ LỌC CÔNG SUẤT (POWER) TRƯỚC TIÊN ---
    if (power) {
      const powerArray = Array.isArray(power) ? power : [power];
      const allProducts = await Product_sanphamModel.find(filterQuery);

      let matchedIds = allProducts.filter(item =>
        item.congsuat?.some(valStr => {
          const num = parseInt(valStr.replace(/\D/g, ''));
          if (isNaN(num)) return false;

          return powerArray.some(rangeStr => {
            if (rangeStr === 'tren-30w') return num > 30;
            const [min, max] = rangeStr.replace(/w/g, '').split('-').map(Number);
            return num >= min && num <= max;
          });
        })
      ).map(item => item._id);

      if (matchedIds.length > 0) {
        const sortedProducts = await Product_sanphamModel.find({ _id: { $in: matchedIds } })
          .sort({ sale: sort === 'asc' ? 1 : (sort === 'desc' ? -1 : -1) });

        matchedIds = sortedProducts.map(item => item._id);
        filterQuery._id = { $in: matchedIds };
      } else {
        filterQuery._id = { $in: [new mongoose.Types.ObjectId()] };
      }
    }

    // --- 3. XỬ LÝ CÁC BỘ LỌC CÒN LẠI (Giá, Nhiệt độ màu...) VÀO FILTERQUERY ---
    if (maxPrice) {
      filterQuery.sale = { $lte: String(maxPrice) };
    }

    if (colorTemp) {
      const colorArray = Array.isArray(colorTemp) ? colorTemp : [colorTemp];
      filterQuery.anhsang = { $in: colorArray };
    }

    // --- 4. SẮP XẾP, PHÂN TRANG VÀ TRUY VẤN CUỐI CÙNG ---
    let sortQuery = {};
    if (sort === 'asc') {
      sortQuery.sale = 1;
    } else if (sort === 'desc') {
      sortQuery.sale = -1;
    } else {
      sortQuery.createdAt = -1;
    }

    const limitNum = Number(limit);
    const pageNum = Number(page);
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product_sanphamModel.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limitNum);

    const product = await Product_sanphamModel.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    // --- TÍNH TOÁN SỐ LƯỢNG CHO TỪNG BỘ LỌC ---
    const baseProductsForCount = await Product_sanphamModel.find({
      nhap: true,
      ...(check1 ? { nhomsp_id: { $in: await Menu_nhom_sanphamModel.find({ danhmuc_id: menu._id }).then(res => res.map(i => i._id)) } } : {}),
      ...(check2 ? { nhomsp_id: { $in: [menu._id] } } : {}),
      ...(!check1 && !check2 && menu ? { nhomsp_id: { $in: await Menu_nhom_sanphamModel.find({ danhmuc_id: menu._id }).then(res => res.map(i => i._id)) } } : {})
    });

    // 1. Đếm số lượng theo Công suất
    const powerCounts = { '0w-10w': 0, '10w-20w': 0, '20w-30w': 0, 'tren-30w': 0 };
    baseProductsForCount.forEach(item => {
      if (!item.congsuat || !Array.isArray(item.congsuat)) return;

      const matchedRanges = new Set();
      item.congsuat.forEach(valStr => {
        const num = parseInt(valStr.replace(/\D/g, ''));
        if (isNaN(num)) return;

        if (num >= 0 && num <= 10) matchedRanges.add('0w-10w');
        if (num > 10 && num <= 20) matchedRanges.add('10w-20w');
        if (num > 20 && num <= 30) matchedRanges.add('20w-30w');
        if (num > 30) matchedRanges.add('tren-30w');
      });
      matchedRanges.forEach(range => powerCounts[range]++);
    });

    // 2. Đếm số lượng theo Nhiệt độ màu
    const colorCounts = { 'Vàng (3000k)': 0, 'Trung Tính(4000k)': 0, 'Trắng (6500k)': 0 };
    baseProductsForCount.forEach(item => {
      if (!item.anhsang || !Array.isArray(item.anhsang)) return;

      Object.keys(colorCounts).forEach(colorKey => {
        if (item.anhsang.includes(colorKey)) {
          colorCounts[colorKey]++;
        }
      });
    });

  const seo ={
    title: menu.title,
    keywords: menu.keywords,
    description: menu.description
  }

    res.render("site/category", {
      product, seo,
      menu,
      totalProducts,
      powerCounts,
      colorCounts,
      currentFilters: req.query,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error("Lỗi tại controller category:", error);
   res.redirect('/404');
  }
};

// PRODUCT SP (sửa an toàn + populate nhomsp_id)
const productsp = async (req, res) => {
  try {
    const id = req.query.id;
    await Product_sanphamModel.updateOne(
      { _id: id },
      { $inc: { view: 1 } } // Tăng trường view lên 1 đơn vị một cách nguyên tử (atomic)
    );
    function slugToTitle(slug) {
      if (!slug) return '';

      // 1. Thay thế dấu gạch ngang (-) thành khoảng trắng
      let result = slug.replace(/-/g, ' ');

      // 2. Viết hoa chữ cái đầu tiên của chuỗi
      result = result.charAt(0).toUpperCase() + result.slice(1);

      return result;
    }

    // Khi dùng trong Controller của bạn:
    const menu = slugToTitle(req.query.menu);
    const product = await Product_sanphamModel.findById(id);
    const products = await Product_sanphamModel.find({
      nhomsp_id: { $in: product.nhomsp_id }
    });
      const seo ={
    title: product.title,
    keywords: product.keywords,
    description: product.description
  }
    res.render("./site/product", { product, menu, products, seo });

  } catch (error) {
    console.error("Lỗi tại controller product:", error);
    // Tránh để trắng trang hoặc treo kết nối khi có lỗi xảy ra
   res.redirect('/404');
  }
};

// CATEGORY DICHVU (giữ logic ghép baiviet + product nhưng an toàn hơn)
const categoryduan = async (req, res) => {
  try {
    const id = req.query.id || "";
    const sortOption = req.query.sort || "newest";
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = 1; // Số bài viết hiển thị trên mỗi trang (bạn có thể thay đổi số này)
    const skip = (page - 1) * limit;

    const menu = await Menu_dichvuModel.find();
    let product = null;
    let products = [];
    let totalProducts = 0; // Tổng số bài viết để tính tổng số trang

    // Xác định điều kiện sắp xếp
    let sortCondition = {};
    if (sortOption === "newest") {
      sortCondition = { createdAt: -1 };
    } else if (sortOption === "oldest") {
      sortCondition = { createdAt: 1 };
    } else if (sortOption === "views") {
      sortCondition = { view: -1 };
    }

    // Điều kiện query chung
    let queryCondition = { nhap: true };

    if (id && mongoose.isValidObjectId(id)) {
      product = await Menu_dichvuModel.findById(id);
      if (product) {
        queryCondition.menudichvu_id = id;
      }
    }

    if (!product && id) {
      // Trường hợp có truyền id nhưng không hợp lệ/không tồn tại, lấy product đầu tiên làm mốc nếu cần
      product = await Menu_dichvuModel.findOne();
    } else if (!product && !id) {
      product = await Menu_dichvuModel.findOne();
    }
const safeProduct = product || { name: "Chưa có danh mục", images: "default.jpg" };
    // 1. Đếm tổng số lượng bài viết thỏa mãn điều kiện
    totalProducts = await BaivietdichvuModel.countDocuments(queryCondition);

    // 2. Lấy danh sách bài viết theo phân trang (.skip và .limit)
    products = await BaivietdichvuModel.find(queryCondition)
      .sort(sortCondition)
      .skip(skip)
      .limit(limit)
      .populate({ path: "menudichvu_id" });

    // Tính tổng số trang
    const totalPages = Math.ceil(totalProducts / limit);
      const seo ={
    title: product.title,
    keywords: product.keywords,
    description: product.description
  };

    // Render ra view kèm theo thông tin phân trang
    res.render("./site/category_duan", {
      menu, seo,
      products,
      product: safeProduct,
      id,
      sort: sortOption,
      currentPage: page,
      totalPages: totalPages
    });

  } catch (error) {
    console.error("Lỗi categoryduan:", error);
    res.redirect('/404');
  }
};

const duan = async (req, res) => {
  try {
    const id = req.query.id;
    await BaivietdichvuModel.updateOne(
      { _id: id },
      { $inc: { view: 1 } } // Tăng trường view lên 1 đơn vị một cách nguyên tử (atomic)
    );
    const product = await BaivietdichvuModel.findById(id).populate({ path: "menudichvu_id" });

    // Giả sử product.content là một mảng, ví dụ: ["Đoạn 1...", "Đoạn 2..."]
    const contentArray = product.content || [];

    // 1. Gộp mảng thành một chuỗi văn bản
    // (Nếu content chứa object hoặc HTML, cần điều chỉnh cách lấy text bên trong)
    const fullText = contentArray.join(" ");

    // 2. (Tùy chọn) Xóa các thẻ HTML nếu có bằng Regex
    const cleanText = fullText.replace(/<[^>]*>?/gm, '');

    // 3. Đếm số từ (tách bằng khoảng trắng)
    const wordCount = cleanText.trim() ? cleanText.trim().split(/\s+/).length : 0;

    // 4. Tính số phút đọc (Tốc độ trung bình: 200 từ/phút)
    const wordsPerMinute = 200;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    // 1. Lấy danh sách các ID từ menudichvu_id của sản phẩm hiện tại
    const menuIds = product.menudichvu_id.map(item => item._id);

    // 2. Truy vấn tìm tất cả các bài viết liên quan
    const products = await BaivietdichvuModel.find({
      menudichvu_id: { $in: menuIds }, // Thuộc một trong các danh mục này
      _id: { $ne: product._id }         // Loại trừ bài viết hiện tại đang xem
    }).populate({ path: "menudichvu_id" });

    const menu = await Menu_dichvuModel.find();
      const seo ={
    title: product.title,
    keywords: product.keywords,
    description: product.description
  };

    res.render("./site/product_duan", { product, readingTime, products, menu, seo,});
  } catch (error) {
    console.error("Lỗi product dự án:", error);
    res.redirect('/404');
  }


};

// CATEGORY TINTUC
const categoryitintuc = async (req, res) => {
  try {
    const id = req.query.id || "";
    const sortOption = req.query.sort || "newest";
    const page = parseInt(req.query.page) || 1; 
    const limit = 6; 
    const skip = (page - 1) * limit;

    const menu = await Menu_tintucModel.find();
    let product = null;
    let products = [];
    let totalProducts = 0; 

    // Xác định điều kiện sắp xếp
    let sortCondition = {};
    if (sortOption === "newest") {
      sortCondition = { createdAt: -1 };
    } else if (sortOption === "oldest") {
      sortCondition = { createdAt: 1 };
    } else if (sortOption === "views") {
      sortCondition = { view: -1 };
    }

    // Điều kiện query chung
    let queryCondition = { nhap: true };

    if (id && mongoose.isValidObjectId(id)) {
      product = await Menu_tintucModel.findById(id);
      if (product) {
        queryCondition.menutintuc_id = id;
      }
    }

    if (!product && id) {
      product = await Menu_tintucModel.findOne();
    } else if (!product && !id) {
      product = await Menu_tintucModel.findOne();
    }

    // --- AN TOÀN: Gán giá trị mặc định nếu product là null ---
    const safeProduct = product || { name: "Tin tức", content: "" };

    // 1. Đếm tổng số lượng bài viết thỏa mãn điều kiện
    totalProducts = await BaiviettintucModel.countDocuments(queryCondition);

    // 2. Lấy danh sách bài viết theo phân trang
    products = await BaiviettintucModel.find(queryCondition)
      .sort(sortCondition)
      .skip(skip)
      .limit(limit)
      .populate({ path: "menutintuc_id" });

    // Tính tổng số trang
    const totalPages = Math.ceil(totalProducts / limit) || 1;
          const seo ={
    title: product.title,
    keywords: product.keywords,
    description: product.description
  };

    // Render ra view kèm theo thông tin an toàn
    res.render("./site/category_tintuc", {
      menu,seo,
      products,
      product: safeProduct, // Dùng biến an toàn thay vì product gốc
      id,
      sort: sortOption,
      currentPage: page,
      totalPages: totalPages
    });

  } catch (error) {
    console.error("Lỗi categorytintuc:", error);
    res.redirect('/404');
  }
};

// PRODUCT TINTUC (ObjectId or slug)
const productTinTuc = async (req, res) => {
  try {
    const id = req.query.id;
    await BaiviettintucModel.updateOne(
      { _id: id },
      { $inc: { view: 1 } } // Tăng trường view lên 1 đơn vị một cách nguyên tử (atomic)
    );
    const product = await BaiviettintucModel.findById(id).populate({ path: "menutintuc_id" });

    // Giả sử product.content là một mảng, ví dụ: ["Đoạn 1...", "Đoạn 2..."]
    const contentArray = product.content || [];

    // 1. Gộp mảng thành một chuỗi văn bản
    // (Nếu content chứa object hoặc HTML, cần điều chỉnh cách lấy text bên trong)
    const fullText = contentArray.join(" ");

    // 2. (Tùy chọn) Xóa các thẻ HTML nếu có bằng Regex
    const cleanText = fullText.replace(/<[^>]*>?/gm, '');

    // 3. Đếm số từ (tách bằng khoảng trắng)
    const wordCount = cleanText.trim() ? cleanText.trim().split(/\s+/).length : 0;

    // 4. Tính số phút đọc (Tốc độ trung bình: 200 từ/phút)
    const wordsPerMinute = 100;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);



    // 2. Truy vấn tìm tất cả các bài viết liên quan
    const products = await BaiviettintucModel.find({
      menutintuc_id: { $in: product.menutintuc_id }, // Thuộc một trong các danh mục này
      _id: { $ne: product._id }         // Loại trừ bài viết hiện tại đang xem
    }).populate({ path: "menutintuc_id" });

    const menu = await Menu_tintucModel.find();
          const seo ={
    title: product.title,
    keywords: product.keywords,
    description: product.description
  }

    res.render("./site/product_tintuc", { product, readingTime, products, menu, seo});
  } catch (error) {
    console.error("Lỗi product dự án:", error);
    res.redirect('/404');
  }

};

const tuvan = async (req, res) => {
  try {
      const thongtintrang = await Thong_tin_trangModel.findOne();
  const seo ={
    title: "TƯ VẤN GIẢI PHÁP CHIẾU SÁNG",
    keywords: thongtintrang.keywords,
    description: thongtintrang.description
  }
res.render("./site/tuvan", {seo});

  } catch (error) {
    console.error("Lỗi tư vấn:", error);
    res.redirect('/404');
  }
  
}

const guilienhe = async (req, res) => {
  try {
    const { file, body } = req;
    const prefix = "TV";

    // Lấy ngày, tháng, năm hiện tại
    const now = new Date();
    const year = now.getFullYear(); // 2026
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 08
    const day = String(now.getDate()).padStart(2, '0'); // 04
    const dateStr = String(year).slice(-2) + month + day;

    // Tạo 6 số ngẫu nhiên từ 000000 đến 999999
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);

    // Ghép lại thành mã hoàn chỉnh
    const code = `${prefix}${dateStr}-${randomSixDigits}`;
    const lienhe = {
      matuvan: code,
      name: body.name || " ",
      sdt: body.sdt || " ",
      email: body.email || " ",
      khachhang: body.khachhang || " ",
      diachi: body.khuvuc || " ",
      nhucau: body.needs || " ",
      noidung: body.noidung || " ",
      trangthai: false,
    };
    if (file) {
      fs.renameSync(file.path, path.resolve("src/public/site/images/update", file.originalname));
      lienhe["images"] = file.originalname;
      const add = {
        images: file.originalname,
        note: "02"
      };
      new ImagesModel(add).save();
    }
    const savedTuvan = await new TuvanModel(lienhe).save();

    // Gửi email xác nhận
    const thongtintrang = res.locals.thongtintrang;

    const imageFileName = savedTuvan.images; // ví dụ: "shopping.webp"
    const filePath = path.resolve(`src/public/site/images/update/${imageFileName}`);

    let imageSizeInMB = 0;

    try {
      // Kiểm tra xem file có tồn tại không trước khi đọc
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size; // Kích thước tính bằng Bytes

        // Chuyển đổi từ Bytes sang MB (1 MB = 1024 * 1024 Bytes)
        imageSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2); // Làm tròn 2 chữ số thập phân
      }
    } catch (error) {
      console.error("Lỗi khi đọc kích thước file:", error);
    }

    const html = await ejs.renderFile(
      path.join(req.app.get("views"), "site/email-tuvan.ejs"),
      { savedTuvan, thongtintrang, imageSizeInMB }
    );

    await transporter.sendMail({
      from: '"ĐÈN LED HỢP THÀNH" <kinhdoanh.deevisco@gmail.com>',
      to: savedTuvan.email,
      subject: `Xác nhận yêu cầu tư vẫn ${savedTuvan.matuvan} từ Đèn Led Hợp Thành`,
      html
    });

    res.redirect(`/success?id=${savedTuvan._id}&code=${savedTuvan.matuvan}`);
  } catch (err) {
    console.error("❌ Lỗi tại guilienhe:", err);
    res.redirect('/404');
  }
};

const success = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await TuvanModel.findById(id);

    const imageFileName = product.images;
    const filePath = path.resolve(`src/public/site/images/update/${imageFileName}`);

    let imageSizeInMB = 0;

    try {
      // Kiểm tra xem file có tồn tại không trước khi đọc
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size; // Kích thước tính bằng Bytes

        // Chuyển đổi từ Bytes sang MB (1 MB = 1024 * 1024 Bytes)
        imageSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2); // Làm tròn 2 chữ số thập phân
      }
    } catch (error) {
      console.error("Lỗi khi đọc kích thước file:", error);
    }

    // Sau đó bạn có thể đính kèm imageSizeInMB vào object product hoặc truyền riêng sang EJS
    product.sizeInMB = imageSizeInMB;
          const thongtintrang = await Thong_tin_trangModel.findOne();
  const seo ={
    title: "TƯ VẤN GIẢI PHÁP CHIẾU SÁNG",
    keywords: thongtintrang.keywords,
    description: thongtintrang.description
  }
    res.render("./site/success", { product, seo });
  } catch (err) {
    console.error("❌ Lỗi tại success:", err);
    res.redirect('/404');
  }
};

const cart = async (req, res) => {
  try {
    const cart = req.session.cart;
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const products = await Product_sanphamModel.aggregate([
      { $match: { nhap: true } }, // Lọc các sản phẩm có nhap: true (thay thế cho .find({nhap: true}))
      { $sample: { size: 20 } }    // Lấy ngẫu nhiên 5 sản phẩm (bạn có thể thay đổi số lượng tùy ý)
    ]);
          const thongtintrang = await Thong_tin_trangModel.findOne();
  const seo ={
    title: "Giỏ hàng",
    keywords: thongtintrang.keywords,
    description: thongtintrang.description
  }

    res.render("./site/cart", { cart, totalPrice, products, seo });
  } catch (err) {
    console.error("❌ Lỗi tại cart:", err);
    res.redirect('/404');
  }
};

const addcart = async (req, res) => {
  const id = req.params.id;
  const qty = parseInt(req.body.qty) || parseInt(req.query.quantity) || 1;

  // Đảm bảo giỏ hàng đã được khởi tạo
  if (!req.session.cart) {
    req.session.cart = [];
  }
  const items = req.session.cart;
  let isProductExists = false;

  items.map((item) => {
    if (item.id === id) {
      item.qty += qty;
      isProductExists = true;
    }
    return item;
  });

  if (!isProductExists) {
    const product = await Product_sanphamModel.findById(id);
    if (product) {
      items.push({
        id,
        name: product.name,
        anhsang: req.body.anhsang || "",
        thumbnail: product.image && product.image[0] ? product.image[0].images : '',
        price: product.sale,
        qty: qty,
        sku: product.sku
      });
    }
  }

  req.session.cart = items;

  // Tính tổng số lượng mới
  const totalQty = req.session.cart.reduce((total, item) => total + item.qty, 0);

  // --- SỬA LẠI ĐIỀU KIỆN Ở ĐÂY ---
  // Chỉ trả về JSON nếu request được gửi từ Fetch (AJAX) có kèm header Accept: application/json
  const acceptHeader = req.headers.accept || '';
  if (acceptHeader.includes('application/json')) {
    return res.json({
      success: true,
      totalQty: totalQty
    });
  }

  // Nếu là bấm "Mua ngay" (submit form thông thường), chuyển hướng sang trang giỏ hàng
  return res.redirect("/gio-hang");
}

const updatecart = async (req, res) => {
  try {
    const items = req.session.cart || [];
    const qtys = req.body.qty || {};
    const actionType = req.body.actionType; // Nhận diện nút được bấm ('update' hoặc 'checkout')

    // 1. Lọc bỏ sản phẩm đã xóa ở view và cập nhật lại số lượng mới
    const newItems = items
      .filter((item) => qtys[item.id] !== undefined)
      .map((item) => {
        const newQty = parseInt(qtys[item.id]);
        if (!isNaN(newQty) && newQty > 0) {
          item.qty = newQty;
        }
        return item;
      });

    // 2. Lưu lại vào session
    req.session.cart = newItems;

    // 3. Điều hướng dựa trên hành động của người dùng
    if (actionType === 'checkout') {
      return res.redirect("/checkout"); // Chuyển sang trang thanh toán/đặt hàng
    } else {
      return res.redirect("/gio-hang"); // Mặc định ở lại trang giỏ hàng
    }
  } catch (error) {
    console.error("Lỗi cập nhật giỏ hàng:", error);
    return res.redirect("/gio-hang");
  }
};

const deletecart = async (req, res) => {
  const { id } = req.params;
  let items = req.session.cart;
  const newItems = items.filter((item) => item.id != id);
  req.session.cart = newItems;
  res.redirect('back'); // Express sẽ tự lấy từ `Referer`
}
const deletecart2 = async (req, res) => {
  req.session.cart = [];
  res.redirect("/gio-hang"); // Express sẽ tự lấy từ `Referer`
}


const checkout = async (req, res) => {
  const cart = req.session.cart
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const thongtintrang = await Thong_tin_trangModel.findOne();
  const seo ={
    title: "Giỏ hàng",
    keywords: thongtintrang.keywords,
    description: thongtintrang.description
  }

  res.render("./site/order", { cart, totalPrice, seo })
}
const order = async (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.redirect("/");
  }
  const body = req.body;
  const cart = req.session.cart;
  const prefix = "ĐH-HTC";

  // Lấy ngày, tháng, năm hiện tại
  const now = new Date();
  const year = now.getFullYear(); // 2026
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 08
  const day = String(now.getDate()).padStart(2, '0'); // 04
  const dateStr = String(year).slice(-2) + month + day;

  // Tạo 6 số ngẫu nhiên từ 000000 đến 999999
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);

  // Ghép lại thành mã hoàn chỉnh
  const code = `${prefix}${dateStr}-${randomSixDigits}`;

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let ship = 0;
  if (body.shipping_method === "Giao hàng nhanh (Trong ngày)") {
    ship = 30000;
  }
  else if (body.shipping_method === "Giao hàng hỏa tốc (2 - 4 giờ)") {
    ship = 60000;
  }
  else {
    if (totalPrice < 1000000) {
      ship = 30000;
    }
    else { ship = 0 }
  };
  const finalTotalPrice = totalPrice + ship;
  const products = await Product_sanphamModel.aggregate([
    { $match: { nhap: true } }, // Lọc các sản phẩm có nhap: true (thay thế cho .find({nhap: true}))
    { $sample: { size: 20 } }]);  // Lấy ngẫu nhiên 5 sản phẩm (bạn có thể thay đổi số lượng tùy ý)

  const product = {
    madonhang: code,
    name: body.name || " ",
    sdt: body.sdt || " ",
    email: body.email || " ",
    namecty: body.name_cty || " ",
    tax: body.tax || " ",
    addcty: body.add_cty || " ",
    diachigiaohang: body.shipping_receive_type || " ",
    diachigiao: body.add_chitiet + ", " + body.phuong + ", " + body.quan + ", " + body.thanhpho || " ",
    note: body.note,
    vanchuyen: body.shipping_method,
    thanhtoan: body.payment_method,
    ship: ship,
    item: req.session.cart,
    trangthai: false,
  };
  const saveOrder = await new OrderModel(product).save();

  // Gửi email xác nhận

  const thongtintrang = res.locals.thongtintrang;
  const html = await ejs.renderFile(
    path.join(req.app.get("views"), "site/email_order.ejs"),
    { saveOrder, totalPrice, finalTotalPrice, thongtintrang }
  );

  await transporter.sendMail({
    from: '"ĐÈN LED HỢP THÀNH" <kinhdoanh.deevisco@gmail.com>',
    to: saveOrder.email,
    subject: `Xác nhận đơn hàng ${saveOrder.madonhang} từ Đèn Led Hợp Thành`,
    html
  });
  req.session.cart = [];
  const seo ={
    title: "Giỏ hàng",
    keywords: thongtintrang.keywords,
    description: thongtintrang.description
  }


// 1. Tạo sẵn biến fullUrl mặc định
const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;


  res.render("./site/success-order.ejs", { cart, saveOrder, totalPrice, finalTotalPrice, products, seo, fullUrl })
}

const search = async (req, res) => {
  try {
    const id = req.query.id;
    const keyword = req.query.keyword; // Đã có sẵn biến keyword ở đây
    let check1 = null;
    let check2 = null;

    if (mongoose.isValidObjectId(id)) {
      check1 = await Menu_danhmuc_sanphamModel.findById(id);
      if (!check1) {
        check2 = await Menu_nhom_sanphamModel.findById(id);
      }
    }

    let menu;
    let filterQuery = { nhap: true };

    if (check1) {
      menu = check1;
      const product1 = await Menu_nhom_sanphamModel.find({ danhmuc_id: menu._id });
      const nhomIds = product1.map(item => item._id);
      filterQuery.nhomsp_id = { $in: nhomIds };
    } else if (check2) {
      menu = check2;
      filterQuery.nhomsp_id = { $in: [menu._id] };
    } else {
      menu = await Menu_danhmuc_sanphamModel.findOne();
      if (menu) {
        const product1 = await Menu_nhom_sanphamModel.find({ danhmuc_id: menu._id });
        const nhomIds = product1.map(item => item._id);
        filterQuery.nhomsp_id = { $in: nhomIds };
      }
    }

    // --- KIỂM TRA AN TOÀN: NẾU KHÔNG TÌM THẤY MENU NÀO TRONG DB ---
    if (!menu) {
      return res.status(404).send("Không tìm thấy danh mục sản phẩm.");
    }

    // --- BỔ SUNG: XỬ LÝ LỌC THEO KEYWORD NẾU NGƯỜI DÙNG NHẬP TỪ KHÓA ---
    if (keyword && keyword.trim() !== '') {
      // Dùng $regex để tìm kiếm gần đúng theo tên sản phẩm (name), 'i' để không phân biệt hoa thường
      filterQuery.name = { $regex: keyword.trim(), $options: 'i' };
    }

    // --- 1. LẤY CÁC THAM SỐ TỪ URL ---
    const { maxPrice, power, colorTemp, limit = 12, page = 1, sort } = req.query;

    // --- 2. XỬ LÝ LỌC CÔNG SUẤT (POWER) TRƯỚC TIÊN ---
    if (power) {
      const powerArray = Array.isArray(power) ? power : [power];
      const allProducts = await Product_sanphamModel.find(filterQuery);

      let matchedIds = allProducts.filter(item =>
        item.congsuat?.some(valStr => {
          const num = parseInt(valStr.replace(/\D/g, ''));
          if (isNaN(num)) return false;

          return powerArray.some(rangeStr => {
            if (rangeStr === 'tren-30w') return num > 30;
            const [min, max] = rangeStr.replace(/w/g, '').split('-').map(Number);
            return num >= min && num <= max;
          });
        })
      ).map(item => item._id);

      if (matchedIds.length > 0) {
        const sortedProducts = await Product_sanphamModel.find({ _id: { $in: matchedIds } })
          .sort({ sale: sort === 'asc' ? 1 : (sort === 'desc' ? -1 : -1) });

        matchedIds = sortedProducts.map(item => item._id);
        filterQuery._id = { $in: matchedIds };
      } else {
        filterQuery._id = { $in: [new mongoose.Types.ObjectId()] };
      }
    }

    // --- 3. XỬ LÝ CÁC BỘ LỌC CÒN LẠI (Giá, Nhiệt độ màu...) VÀO FILTERQUERY ---
    if (maxPrice) {
      filterQuery.sale = { $lte: String(maxPrice) };
    }

    if (colorTemp) {
      const colorArray = Array.isArray(colorTemp) ? colorTemp : [colorTemp];
      filterQuery.anhsang = { $in: colorArray };
    }

    // --- 4. SẮP XẾP, PHÂN TRANG VÀ TRUY VẤN CUỐI CÙNG ---
    let sortQuery = {};
    if (sort === 'asc') {
      sortQuery.sale = 1;
    } else if (sort === 'desc') {
      sortQuery.sale = -1;
    } else {
      sortQuery.createdAt = -1;
    }

    const limitNum = Number(limit);
    const pageNum = Number(page);
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product_sanphamModel.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limitNum);

    const product = await Product_sanphamModel.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    // --- TÍNH TOÁN SỐ LƯỢNG CHO TỪNG BỘ LỌC ---
    const baseProductsForCount = await Product_sanphamModel.find({
      nhap: true,
      ...(keyword && keyword.trim() !== '' ? { name: { $regex: keyword.trim(), $options: 'i' } } : {}),
      ...(check1 ? { nhomsp_id: { $in: await Menu_nhom_sanphamModel.find({ danhmuc_id: menu._id }).then(res => res.map(i => i._id)) } } : {}),
      ...(check2 ? { nhomsp_id: { $in: [menu._id] } } : {}),
      ...(!check1 && !check2 && menu ? { nhomsp_id: { $in: await Menu_nhom_sanphamModel.find({ danhmuc_id: menu._id }).then(res => res.map(i => i._id)) } } : {})
    });

    // 1. Đếm số lượng theo Công suất
    const powerCounts = { '0w-10w': 0, '10w-20w': 0, '20w-30w': 0, 'tren-30w': 0 };
    baseProductsForCount.forEach(item => {
      if (!item.congsuat || !Array.isArray(item.congsuat)) return;

      const matchedRanges = new Set();
      item.congsuat.forEach(valStr => {
        const num = parseInt(valStr.replace(/\D/g, ''));
        if (isNaN(num)) return;

        if (num >= 0 && num <= 10) matchedRanges.add('0w-10w');
        if (num > 10 && num <= 20) matchedRanges.add('10w-20w');
        if (num > 20 && num <= 30) matchedRanges.add('20w-30w');
        if (num > 30) matchedRanges.add('tren-30w');
      });
      matchedRanges.forEach(range => powerCounts[range]++);
    });

    // 2. Đếm số lượng theo Nhiệt độ màu
    const colorCounts = { 'Vàng (3000k)': 0, 'Trung Tính(4000k)': 0, 'Trắng (6500k)': 0 };
    baseProductsForCount.forEach(item => {
      if (!item.anhsang || !Array.isArray(item.anhsang)) return;

      Object.keys(colorCounts).forEach(colorKey => {
        if (item.anhsang.includes(colorKey)) {
          colorCounts[colorKey]++;
        }
      });
    });
  const seo ={
    title: menu.title,
    keywords: menu.keywords,
    description: menu.description
  }

    res.render("site/search", {
      product, keyword,
      menu, seo,
      totalProducts,
      powerCounts,
      colorCounts,
      currentFilters: req.query,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error("Lỗi tại controller category:", error);
    res.redirect('/404');
  }
};

const apiSearch = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    if (!keyword || keyword.trim() === '') {
      return res.json([]);
    }

    // Tìm kiếm tối đa 5 sản phẩm khớp với từ khóa
    const products = await Product_sanphamModel.find({
      nhap: true,
      name: { $regex: keyword.trim(), $options: 'i' }
    }).limit(10).select('name slug sale image');

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};


















// CATEGORY DANHMUC (tối ưu: query một lần lấy product thuộc các nhomsp)
const categoryDanhmuc = async (req, res) => {
  try {
    const id = req.params.id;
    const slug = req.params.slug;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send("ID danh mục không hợp lệ");
    }

    const menudanhmuc = await Menu_danhmuc_sanphamModel.findById(id);
    if (!menudanhmuc) return res.status(404).send("Không tìm thấy danh mục");

    const nhomsp = await Menu_nhom_sanphamModel.find({ danhmuc_id: id, });

    // Lấy danh sách nhomsp ids
    const nhomIds = nhomsp.map(n => n._id);

    // Tìm tất cả sản phẩm thuộc các nhomsp trên và đã nhap: true (1 query)
    const allProducts = nhomIds.length > 0
      ? await Product_sanphamModel.find({ nhomsp_id: { $in: nhomIds }, nhap: true }).sort({ _id: -1 })
      : [];

    // Pagination (client-side logic preserved: page, limit)
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const totalRows = allProducts.length;
    const totalPages = Math.ceil(totalRows / limit);
    const skip = (page - 1) * limit;

    const product = allProducts.slice(skip, skip + limit);

    res.render("./site/category_menu", {
      menudanhmuc,
      nhomsp,
      product,
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
    console.error("❌ Lỗi tại categoryDanhmuc:", err);
    res.redirect('/404');
  }
};

// CATEGORY ITEM (nhom sản phẩm)
const categoryitem = async (req, res) => {
  try {
    const id = req.params.id;
    const slug = req.params.slug;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send("ID nhóm không hợp lệ");
    }

    const category = await Menu_nhom_sanphamModel.findById(id).populate({ path: "danhmuc_id" });
    if (!category) return res.status(404).send("Không tìm thấy nhóm");

    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const totalRows = await Product_sanphamModel.countDocuments({ nhomsp_id: id, nhap: true });
    const totalPages = Math.ceil(totalRows / limit);

    const product = await Product_sanphamModel
      .find({ nhomsp_id: id, nhap: true })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    const image = await Anh_nhom_san_phamModel.find({ anhnhom_id: id });
    const imageOne = image[0] || [];
    const total = image.slice(1); // phù hợp với logic cũ
    const chiase = await ChiaseModel.find();

    res.render("./site/category_item", {
      category, product, image,
      page,
      totalPages,
      next: page + 1,
      hasNext: page < totalPages,
      prev: page - 1,
      hasPrev: page > 1,
      pages: pagination(page, totalPages),
      slug, id,
      chiase,
    });
  } catch (err) {
    console.error("❌ Lỗi tại categoryitem:", err);
    res.redirect('/404');
  }
};



// PRODUCT DICHVU (an toàn với image[])
const productdichvu = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await BaivietdichvuModel.findById(id);
    if (!product) return res.status(404).send("Không tìm thấy bài viết dịch vụ");

    const total = Array.isArray(product.image) ? product.image.length : 0;
    const imgOne = total > 0 ? (product.image[0]?.images || []) : [];

    const category = await Menu_dichvuModel.findById(product.menudichvu_id);

    const category_noibat = await BaivietdichvuModel.find({ nhap: true })
      .populate({ path: "menudichvu_id" })
      .sort({ _id: -1 });

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
    res.redirect('/404');
  }
};


// DANH SACH VIDEO
const danhsachvideo = async (req, res) => {
  try {
    const baiviet = await BaivietdichvuModel.find({ nhap: true });
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;
    const totalRows = await VideoModel.countDocuments();
    const totalPages = Math.ceil(totalRows / limit);
    const product = await VideoModel.find({}).sort({ _id: -1 }).skip(skip).limit(limit);

    res.render("./site/danhsachvideo", {
      product,
      page,
      totalPages,
      next: page + 1,
      hasNext: page < totalPages,
      prev: page - 1,
      hasPrev: page > 1,
      pages: pagination(page, totalPages),
      baiviet
    });
  } catch (err) {
    console.error("❌ Lỗi tại danhsachvideo:", err);
    res.redirect('/404');
  }
};

// PRODUCT VIDEO
const productvideo = async (req, res) => {
  try {
    const id = req.params.id;
    const baiviet = await Product_sanphamModel.find({ nhap: true });
    const product = await VideoModel.findById(id);
    if (!product) return res.status(404).send("Không tìm thấy video");
    res.render("./site/product_video", { product, baiviet });
  } catch (err) {
    console.error("❌ Lỗi tại productvideo:", err);
    res.redirect('/404');
  }
};


// LIEN HE
const lienhe = async (req, res) => {
  try {
    const thongtin = await Thong_tin_trangModel.find({});
    res.render("./site/lienhe", { thongtin });
  } catch (err) {
    console.error("❌ Lỗi tại lienhe:", err);
    res.redirect('/404');
  }
};




// OTHER SIMPLE ROUTES
const thuocloban = async (req, res) => {
  try {
    const product = await LobanModel.find();
    res.render("./site/thuoc-lo-ban", { product });
  } catch (err) {
    console.error("❌ Lỗi tại thuocloban:", err);
    res.redirect('/404');
  }
};











module.exports = {
  home, category, productsp, categoryduan, duan, categoryitintuc, productTinTuc,
  categoryDanhmuc,
  categoryitem,

  danhsachvideo,
  gioithieu,
  lienhe,
  productdichvu,
  success,
  thuocloban,
  tuvan,
  productvideo,
  guilienhe,
  search, cart, addcart, updatecart, deletecart, deletecart2, order, checkout, apiSearch
};
