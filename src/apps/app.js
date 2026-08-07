const express = require("express");
const session = require("express-session")
const config = require("config");
const app = express();
const fs = require('fs');
const path = require('path');

// config View
app.set("views", config.get("app.view_folder"));
app.set("view engine", config.get("app.view_engine"));

app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(config.get("app.static_folder")));


//config session
// app.use(session({
//   secret: config.get('app.session_key'),
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false }
// }))


require('dotenv').config(); // <-- Đặt ở dòng đầu tiên
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const ImagesModel = require("./models/images");



// Cấu hình session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24, // 1 ngày
  }
}));


//create Cart
app.use(require("./middlewares/cart")),
app.use(require("./middlewares/share")),


app.use(express.static("./public")); //set static location

//Router
app.use(require(config.get("app.router")));



app.delete('/admin/danh-sach-anh/delete-content/:id', async (req, res) => {
  try {
    // Tìm và xoá ảnh trong database
    const result = await ImagesModel.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy ảnh" });
    }

    // Đường dẫn vật lý tới ảnh
    const imagePath = path.join(__dirname, '..', '..', 'public', 'images', result.images);


    // Xoá ảnh vật lý khỏi server
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Không thể xoá ảnh vật lý:", err);
        // Bạn có thể trả warning nhưng không cần fail toàn bộ nếu file không tồn tại
      }
    });

    res.status(200).json({ message: "Xoá thành công" });
  } catch (error) {
    console.error("Lỗi khi xoá ảnh:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

app.delete('/admin/danh-sach-anh/delete-tieu-de/:id', async (req, res) => {
  try {
    const result = await ImagesModel.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy ảnh" });
    }

    // Lấy tên file ảnh từ thuộc tính images trong DB
    const fileName = result.images;

    // Đường dẫn thực tế đến ảnh trên máy chủ
    const imagePath = path.join(__dirname, '..', '..', 'src', 'public', 'site', 'images', 'update', fileName);

    // Xoá ảnh khỏi ổ đĩa nếu tồn tại
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.warn(`⚠️ Không thể xoá ảnh vật lý: ${fileName}`, err.message);
        // Tiếp tục xử lý dù xoá file vật lý lỗi
      }
    });

    res.status(200).json({ message: "Xoá thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi xoá ảnh:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});




app.use((req, res) => {
  
  res.status(404).render("./site/404",); // hoặc send(), tùy nhu cầu
});

module.exports = app;


