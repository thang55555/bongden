const mongoose= require("mongoose");
mongoose.set("strictQuery", true); // ẩn warning
module.exports = ()=>{
    mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected"));
    return mongoose;
};

// mongodb://127.0.0.1:27017/nam_thanh_phat

// mongodb+srv://thang5555:ANHanh9x@deeviscomongodb.ygmbzai.mongodb.net/nam_thanh_phat

//mongodb://admin:Thang5555@103.167.89.205:27017/phongthodep?authSource=admin
