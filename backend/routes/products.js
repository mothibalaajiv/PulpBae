const express = require("express");
const OrderCounter = require("../models/OrderCounter");

const router = express.Router();
const COUNTER_KEY = "global-orders";

const trackedProducts = {
  orangeJuice: "productClicks.orangeJuice",
  coconutWater: "productClicks.coconutWater",
  limeJuice: "productClicks.limeJuice"
};

// POST /api/products/click
// Records which product card was clicked without exposing that count on the website.
router.post("/click", async (request, response) => {
  const { product } = request.body;
  const productField = trackedProducts[product];

  if (!productField) {
    return response.status(400).json({
      success: false,
      message: "Unknown product click type."
    });
  }

  try {
    await OrderCounter.findOneAndUpdate(
      { key: COUNTER_KEY },
      {
        $inc: { [productField]: 1 },
        $setOnInsert: {
          key: COUNTER_KEY,
          totalOrders: 0
        }
      },
      { new: true, upsert: true }
    );

    response.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: "Unable to record the product card click."
    });
  }
});

module.exports = router;
