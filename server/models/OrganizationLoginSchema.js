const mongoose = require("mongoose");
const OrganizationLogin = new mongoose.Schema({
    organization_id: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    c_password: {
        type: String,
        trim: true,
        required: true,
    },
}, {
    timestamps: true
});
module.exports = mongoose.connection.useDb("Organization").model("Login", OrganizationLogin);