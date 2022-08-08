const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../../models/UserSchema");
const Organization = require("../../models/OrganizationSchema");
const jwt = require("jsonwebtoken");
const ShortUniqueId = require("short-unique-id");
const RegistrationEmailSender = require("../../middleware/RegistrationEmailSender");
const id_generate = new ShortUniqueId({
  length: 8,
});
router.post(
  "/api/registration/ceo",
  async (req, res, next) => {
    const { name, email_address, phone_no, aadhar_card } = req.body;
    const { auth, _id } = req.cookies;
    try {
      const aadhar_card_check = await User.findOne({
        aadhar_card: aadhar_card,
      });
      if (aadhar_card_check !== null) {
        return res.status(201).json({
          message: "Aadhar Card already exist",
          type: "warning",
        });
      }
      const user_id = id_generate();
      const generate_auth = jwt.sign(
        {
          auth_id: user_id,
        },
        aadhar_card
      );
      const password = id_generate();
      await User.create({
        auth: generate_auth,
        user_id: user_id,
        type_of_user: "organization",
        user_name: name,
        aadhar_card: aadhar_card,
        email_address: email_address,
        phone_no: phone_no,
        password: bcrypt.hashSync(password, 10),
        c_password: bcrypt.hashSync(password, 10),
      });
      await User.findOneAndUpdate(
        { auth: auth },
        {
          is_valid: false,
        }
      );
      await Organization.findByIdAndUpdate(_id, {
        ceo_id: user_id,
      });
      req.user_id = user_id;
      req.user_name = name;
      req.user_type = "Organization";
      req.email_address = email_address;
      req.password = password;
      res.status(200).json({
        message: "Successfully Registered",
        type: "success",
      });
      next();
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "Invalid Request",
        type: "error",
      });
    }
  },
  RegistrationEmailSender
);
module.exports = router;