const mongoose = require("mongoose");

// This schema stores one shared counter document for all order button clicks.
const orderCounterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global-orders"
    },
    totalOrders: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    productClicks: {
      orangeJuice: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      coconutWater: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      limeJuice: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      }
    }
  },
  {
    timestamps: true,
    collection: "orderCounters"
  }
);

module.exports = mongoose.model("OrderCounter", orderCounterSchema);
