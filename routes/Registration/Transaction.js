const express = require("express");
const bcrypt = require("bcrypt");

const Region = require("../../models/Region");
const Organization = require("../../models/Organization");
const Mine = require("../../models/Mine");
const Warehouse = require("../../models/Warehouse");
const Checkpoint = require("../../models/Checkpoint");
const Lab = require("../../models/Lab");
const Transaction = require("../../models/Transaction");
const Suspicious = require("../../models/Suspicious");
const { AcceptablePercentage } = require("../../Constant");

const router = express.Router();

router.post("/api/registration/mine/transaction", async (req, res) => {
  const { _id } = req.cookies;
  const {
    organization_id,
    type_of_ore,
    grade,
    quantity,
    price,
    royalty,
    vehicle_no,
  } = req.body;
  try {
    const mine_response = await Mine.findById(_id)
      .select(["manager_id", "region_id"])
      .lean();
    const warehouse_response = await Warehouse.aggregate([
      {
        $match: { mine_id: _id },
      },
      {
        $project: {
          _id: 0,
          grade: `$ores_available.${grade}.${type_of_ore}`,
        },
      },
    ]);
    if (
      warehouse_response.length !== 0 &&
      warehouse_response[0].grade < parseInt(quantity)
    ) {
      return res.status(400).json({
        message: "Not enough ore in the warehouse",
        type: "warning",
      });
    }
    const region_response = await Region.findById(mine_response.region_id);
    const mine_average_price_response = await Transaction.aggregate([
      {
        $match: {
          mine_id: _id,
          type_of_ore: type_of_ore,
          grade: grade,
          is_suspicious: false,
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            $lt: new Date(),
          },
        },
      },
      {
        $group: {
          _id: 0,
          price: {
            $avg: "$price",
          },
        },
      },
      {
        $project: {
          _id: 0,
          price: { $ceil: "$price" },
        },
      },
    ]);
    const mine_response_ids = await Mine.find({
      region_id: region_response._id,
    }).distinct("_id");
    const mine_ids = mine_response_ids.map((mine) => mine._id.toString());
    const region_average_price_response = await Transaction.aggregate([
      {
        $match: {
          mine_id: {
            $in: mine_ids,
          },
          type_of_ore: type_of_ore,
          grade: grade,
          is_suspicious: false,
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            $lt: new Date(),
          },
        },
      },
      {
        $group: {
          _id: 0,
          price: {
            $avg: "$price",
          },
        },
      },
      {
        $project: {
          _id: 0,
          price: { $ceil: "$price" },
        },
      },
    ]);
    const organization_response = await Organization.findById(organization_id)
      .select(["ceo_id"])
      .lean();
    const transaction_response = await Transaction.create({
      mine_id: _id,
      manager_id: mine_response.manager_id,
      ceo_id: organization_response.ceo_id,
      buyer_org_id: organization_id,
      type_of_ore: type_of_ore,
      grade: grade,
      quantity: parseInt(quantity),
      price: parseInt(price),
      royalty: parseInt(royalty),
      transaction_hash: bcrypt.hashSync(
        JSON.stringify({
          mine_id: _id,
          manager_id: mine_response.manager_id,
          ceo_id: organization_response.ceo_id,
          buyer_org_id: organization_id,
          type_of_ore: type_of_ore,
          grade: grade,
          quantity: parseInt(quantity),
          price: parseInt(price),
          royalty: parseInt(royalty),
          vehicle_no: vehicle_no,
        }),
        10
      ),
      vehicle_no: vehicle_no,
    });
    await Warehouse.findOneAndUpdate(
      { mine_id: _id },
      {
        $inc: {
          [`ores_available.${grade}.${type_of_ore}`]: -parseInt(quantity),
        },
      }
    );
    if (
      mine_average_price_response.length !== 0 &&
      region_average_price_response.length !== 0
    ) {
      const mine_actual_difference = Math.abs(
        100 - (parseInt(price) * 100) / mine_average_price_response[0].price
      );
      const region_actual_difference = Math.abs(
        100 - (parseInt(price) * 100) / region_average_price_response[0].price
      );
      if (
        mine_actual_difference > AcceptablePercentage &&
        region_actual_difference > AcceptablePercentage
      ) {
        await Suspicious.create({
          region_id: region_response._id,
          mine_id: _id,
          type_of_activity: "transaction",
          reason: `price difference by more then ${AcceptablePercentage}% wrt mine average price`,
          price_difference: mine_actual_difference,
          transaction_id: transaction_response._id,
        });
        await Transaction.findByIdAndUpdate(transaction_response._id, {
          is_suspicious: true,
        });
        const suspicious_response = await Suspicious.find({
          mine_id: _id,
          type_of_activity: {
            $nin: ["all"],
          },
        }).count();
        if (suspicious_response > 3) {
          await Suspicious.create({
            region_id: region_response._id,
            mine_id: _id,
            type_of_activity: "all",
            reason: `Suspicious found more then ${suspicious_response} times`,
          });
        }
      }
    }
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Invalid Request",
      type: "error",
    });
  }
});

router.get("/api/registration/government/transaction", async (req, res) => {
  const { transaction_id } = req.query;
  await Transaction.findByIdAndUpdate(transaction_id, {
    status: "dispatched",
  });
  res.end();
});

router.get("/api/registration/checkpoint/transaction", async (req, res) => {
  const { _id } = req.cookies;
  const { transaction_id } = req.query;
  try {
    const transaction_response = await Transaction.findById(transaction_id);
    if (!transaction_response.checkpoints.includes(_id)) {
      await Transaction.findByIdAndUpdate(transaction_id, {
        $push: {
          checkpoints: _id,
        },
      });
    }
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Invalid Request",
      type: "error",
    });
  }
});

router.get("/api/registration/organization/transaction", async (req, res) => {
  const { _id } = req.cookies;
  const { transaction_id } = req.query;
  try {
    const transaction_response = await Transaction.findByIdAndUpdate(
      transaction_id,
      {
        status: "delivered",
      }
    );
    await Organization.findByIdAndUpdate(_id, {
      $inc: {
        [`ores_bought.${transaction_response.grade}.${transaction_response.type_of_ore}`]:
          transaction_response.quantity,
      },
    });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Invalid Request",
      type: "error",
    });
  }
});

router.post(
  "/api/registration/checkpoint/transaction/lab",
  async (req, res) => {
    const { transaction_id } = req.query;
    try {
      const lab_response = await Lab.findOne();
      await Transaction.findByIdAndUpdate(transaction_id, {
        lab_id: lab_response._id,
      });
      res.status(200).end();
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "Invalid Request",
        type: "error",
      });
    }
  }
);

router.post(
  "/api/registration/checkpoint/transaction/suspicious",
  async (req, res) => {
    const { transaction_id } = req.query;
    const { reason } = req.body;
    const { _id } = req.cookies;
    try {
      const checkpoint_response = await Checkpoint.findById(_id);
      const transaction_response = await Transaction.findById(transaction_id);
      await Suspicious.create({
        region_id: checkpoint_response.region_id,
        mine_id: transaction_response.mine_id,
        type_of_activity: "checkpoint",
        reason: reason,
        transaction_id: transaction_id,
      });
      res.status(200).end();
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "Invalid Request",
        type: "error",
      });
    }
  }
);

module.exports = router;
