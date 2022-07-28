const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Organization = require("../../models/OrganizationSchema");
const User = require("../../models/UserSchema");
const jwt = require("jsonwebtoken");
const ShortUniqueId = require("short-unique-id");
const RegistrationEmailSender = require("../../middleware/RegistrationEmailSender");
const id_genarate = new ShortUniqueId({
  length: 8,
});
router.post(
  "/api/registration/organization",
  async (req, res, next) => {
    const {
      organization_name,
      address,
      ceo_name,
      email_address,
      phone_no,
      aadhar_card,
      gst_no,
    } = req.body;
    try {
      const organization_check = await Organization.findOne({
        gst_no: gst_no,
      });
      if (organization_check !== null) {
        return res.status(201).json({
          message: "GST Number already exist",
          type: "warning",
        });
      }
      const aadhar_card_check = await User.findOne({
        aadhar_card: aadhar_card,
      });
      if (aadhar_card_check !== null) {
        return res.status(201).json({
          message: "Aadhar Card already exist",
          type: "warning",
        });
      }
      const email_address_check = await User.findOne({
        email_address: email_address,
      });
      if (email_address_check !== null) {
        return res.status(201).json({
          message: "Email Address already exist",
          type: "warning",
        });
      }
      const ceo_id = id_genarate();
      const auth = jwt.sign(
        {
          auth_id: ceo_id,
        },
        aadhar_card
      );
      const password = id_genarate();
      const user_response = await User.create({
        auth: auth,
        user_id: ceo_id,
        type_of_user: "organization",
        user_name: ceo_name,
        aadhar_card: aadhar_card,
        email_address: email_address,
        phone_no: phone_no,
        password: bcrypt.hashSync(password, 10),
        c_password: bcrypt.hashSync(password, 10),
      });
      await Organization.create({
        ceo_id: ceo_id,
        organization_name: organization_name,
        gst_no: gst_no,
        address: address,
      });
      req.user_id = user_response.user_id;
      req.user_name = user_response.user_name;
      req.user_type = "Organization";
      req.email_address = user_response.email_address;
      req.password = user_response.password;
      res.status(200).json({
        message: "Successfully Registered",
        type: "success",
      });
      next();
    } catch (error) {
      res.status(400).json({
        message: "Invalid Request",
        type: "error",
      });
    }
  },
  RegistrationEmailSender
);
module.exports = router;
