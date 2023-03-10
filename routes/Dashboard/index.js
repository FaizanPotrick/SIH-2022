const express = require("express");
const mongoose = require("mongoose");

const Organization = require("../../models/Organization");
const Mine = require("../../models/Mine");
const CheckPoint = require("../../models/CheckPoint");
const Transaction = require("../../models/Transaction");

const router = express.Router();

router.get("/api/dashboard/organization", async (req, res) => {
  let _id = req.cookies._id;
  if (req.query.organization_id) {
    _id = req.query.organization_id;
  }
  const response = await Organization.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(_id),
      },
    },
    {
      $project: {
        _id: 0,
        title: "$organization_name",
        cards: [
          {
            title: "Total High Ores Bought(in mt)",
            value: "$ores_bought.high",
          },
          {
            title: "Total Medium Ores Bought(in mt)",
            value: "$ores_bought.medium",
          },
          {
            title: "Total Low Ores Bought(in mt)",
            value: "$ores_bought.low",
          },
        ],
      },
    },
  ]);
  res.json(response[0]);
});

router.get("/api/dashboard/mine", async (req, res) => {
  let _id = req.cookies._id;
  if (req.query.mine_id) {
    _id = req.query.mine_id;
  }
  const response = await Mine.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(_id),
      },
    },
    {
      $addFields: {
        mine_id: {
          $toString: "$_id",
        },
      },
    },
    {
      $lookup: {
        from: "warehouses",
        localField: "mine_id",
        foreignField: "mine_id",
        as: "warehouse",
      },
    },
    {
      $unwind: "$warehouse",
    },
    {
      $lookup: {
        from: "transactions",
        pipeline: [
          {
            $match: {
              mine_id: _id,
              type_of_ore: "fine",
              grade: "high",
              is_suspicious: false,
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                $lte: new Date(),
              },
            },
          },
        ],
        as: "fine_high",
      },
    },
    {
      $lookup: {
        from: "transactions",
        pipeline: [
          {
            $match: {
              mine_id: _id,
              type_of_ore: "fine",
              grade: "medium",
              is_suspicious: false,
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                $lte: new Date(),
              },
            },
          },
        ],
        as: "fine_medium",
      },
    },
    {
      $lookup: {
        from: "transactions",
        pipeline: [
          {
            $match: {
              mine_id: _id,
              type_of_ore: "fine",
              grade: "low",
              is_suspicious: false,
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                $lte: new Date(),
              },
            },
          },
        ],
        as: "fine_low",
      },
    },
    {
      $lookup: {
        from: "transactions",
        pipeline: [
          {
            $match: {
              mine_id: _id,
              type_of_ore: "lump",
              grade: "high",
              is_suspicious: false,
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                $lte: new Date(),
              },
            },
          },
        ],
        as: "lump_high",
      },
    },
    {
      $lookup: {
        from: "transactions",
        pipeline: [
          {
            $match: {
              mine_id: _id,
              type_of_ore: "lump",
              grade: "medium",
              is_suspicious: false,
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                $lte: new Date(),
              },
            },
          },
        ],
        as: "lump_medium",
      },
    },
    {
      $lookup: {
        from: "transactions",
        pipeline: [
          {
            $match: {
              mine_id: _id,
              type_of_ore: "lump",
              grade: "low",
              is_suspicious: false,
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                $lte: new Date(),
              },
            },
          },
        ],
        as: "lump_low",
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "mine_id",
        foreignField: "mine_id",
        as: "transactions",
      },
    },
    {
      $lookup: {
        from: "suspicious",
        localField: "mine_id",
        foreignField: "mine_id",
        as: "suspicious",
      },
    },
    {
      $addFields: {
        total_transactions: { $size: "$transactions" },
        total_suspicious_transactions: {
          $size: {
            $filter: {
              input: "$transactions",
              as: "transaction",
              cond: { $eq: ["$$transaction.is_suspicious", true] },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        fine_high: {
          $map: {
            input: "$fine_high",
            as: "high",
            in: "$$high.price",
          },
        },
        fine_medium: {
          $map: {
            input: "$fine_medium",
            as: "medium",
            in: "$$medium.price",
          },
        },
        fine_low: {
          $map: {
            input: "$fine_low",
            as: "low",
            in: "$$low.price",
          },
        },
        lump_high: {
          $map: {
            input: "$lump_high",
            as: "high",
            in: "$$high.price",
          },
        },
        lump_medium: {
          $map: {
            input: "$lump_medium",
            as: "medium",
            in: "$$medium.price",
          },
        },
        lump_low: {
          $map: {
            input: "$lump_low",
            as: "low",
            in: "$$low.price",
          },
        },
        title: "$mine_name",
        cards: [
          {
            title: "Total High Ores Available(in mt)",
            value: "$warehouse.ores_available.high",
          },
          {
            title: "Total Medium Ores Available(in mt)",
            value: "$warehouse.ores_available.medium",
          },
          {
            title: "Total Low Ores Available(in mt)",
            value: "$warehouse.ores_available.low",
          },
          {
            title: "Lease Period",
            value: "$lease_period.to",
          },
          {
            title: "Average High Ores Price",
            value: {
              fine: { $ceil: { $avg: "$fine_high.price" } },
              lump: { $ceil: { $avg: "$lump_high.price" } },
            },
          },
          {
            title: "Average Medium Ores Price",
            value: {
              fine: { $ceil: { $avg: "$fine_medium.price" } },
              lump: { $ceil: { $avg: "$lump_medium.price" } },
            },
          },
          {
            title: "Average Low Ores Price",
            value: {
              fine: { $ceil: { $avg: "$fine_low.price" } },
              lump: { $ceil: { $avg: "$lump_low.price" } },
            },
          },
          {
            title: "Total ROM",
            value: "$rom",
          },
          {
            title: "Total Suspicious Activities",
            value: {
              $size: "$suspicious",
            },
          },
          {
            title: "Suspicious Transactions",
            value: {
              $concat: [
                { $toString: "$total_suspicious_transactions" },
                " / ",
                { $toString: "$total_transactions" },
              ],
            },
          },
        ],
      },
    },
  ]);
  res.json(response[0]);
});

router.get("/api/dashboard/checkpoint", async (req, res) => {
  let _id = req.cookies._id;
  if (req.query.checkpoint_id) {
    _id = req.query.checkpoint_id;
  }
  const response = await Transaction.aggregate([
    {
      $match: {
        checkpoints: {
          $in: [_id],
        },
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
  ]);
  res.json(response);
});

router.get("/api/dashboard/lab", async (req, res) => {
  let _id = req.cookies._id;
  if (req.query.lab_id) {
    _id = req.query.lab_id;
  }
  const response = await Transaction.find({
    lab_id: _id,
  })
    .sort({
      updatedAt: -1,
    })
    .lean();
  res.json(response);
});

module.exports = router;
