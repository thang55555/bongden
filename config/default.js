const path = require("path");

module.exports = {
    app: {
    port: 3003,
    static_folder: path.join(__dirname, "../src/public"),
    router: path.join(__dirname, "../src/routers/web"),
    view_folder: path.join(__dirname, "../src/apps/views"),
    view_engine: "ejs",
    session_key: "Vietpro_session",
  },
    mail:{
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "kinhdoanh.deevisco@gmail.com",
            pass: "knll qcns fiwb xnob",
        },
    }
}
 
