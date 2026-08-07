const UserModel = require("../models/users");
const getLogin = (req, res)=>{
    res.render("./admin/login", {data:{}})
}
const postLogin = async (req, res)=>{
    let {email, password} = req.body;
    const Users = await UserModel.find({email:email, password:password});
    if(Users.length > 0 ){
        req.session.email = email,
        res.redirect("/admin/dashboard")
    }
    else{
        res.render("./admin/login", {data: {error:"Tài khoản không họp lệ"}});
    }
}
const logout = (req, res)=>{
    req.session.destroy(); 
    res.redirect("/admin/login")
}
module.exports = {
    getLogin,
    postLogin,
    logout,
};
