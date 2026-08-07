const mongoose = require("../../common/database")();

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: null,
    },
    role: {
        type: String,
        default: "member",
    },
    fullName: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const UserModel = mongoose.model("Users", userSchema, "users");
module.exports = UserModel; 
