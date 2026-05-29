const express = require("express");
const OrderCounter = require("../models/OrderCounter");

const router = express.Router();
const COUNTER_KEY = "global-orders";

// GET /api/orders
// Returns the current total count. If the document does not exist yet, it creates it.
router.get("/", async (request, response) => {
  try {
    const counter = await OrderCounter.findOneAndUpdate(
      { key: COUNTER_KEY },
      { $setOnInsert: { key: COUNTER_KEY, totalOrders: 0 } },
      { new: true, upsert: true }
    );

    response.status(200).json({
      success: true,
      totalOrders: counter.totalOrders
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: "Unable to fetch the order counter."
    });
  }
});

// POST /api/orders/increment
// Adds one click to the shared counter and returns the updated total.
router.post("/increment", async (request, response) => {
  try {
    const counter = await OrderCounter.findOneAndUpdate(
      { key: COUNTER_KEY },
      {
        $inc: { totalOrders: 1 },
        $setOnInsert: { key: COUNTER_KEY }
      },
      { new: true, upsert: true }
    );

    response.status(200).json({
      success: true,
      totalOrders: counter.totalOrders
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: "Unable to update the order counter."
    });
  }
});

module.exports = router;
