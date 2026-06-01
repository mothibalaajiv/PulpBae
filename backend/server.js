const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const OrderCounter = require("./models/OrderCounter");
const ordersRouter = require("./routes/orders");
const productsRouter = require("./routes/products");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const COUNTER_KEY = "global-orders";
const DATABASE_NAME = process.env.MONGODB_DB_NAME || "pulpbae";
const isProduction = process.env.NODE_ENV === "production";

// Convert the comma-separated CORS_ORIGIN value into a clean allowlist.
const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set(configuredOrigins)];

function isLocalDevelopmentOrigin(origin) {
  if (isProduction) {
    return false;
  }

  if (origin === "null") {
    return true;
  }

  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch (error) {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow API clients with no browser origin, such as Postman or Render health checks.
      // Local development accepts any localhost/127.0.0.1 port, including 8080.
      if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);

app.use(express.json());

// Simple health check route for Render and uptime monitors.
app.get("/", (request, response) => {
  response.status(200).json({
    success: true,
    message: "PulpBae API is fresh and running."
  });
});

app.use("/api/orders", ordersRouter);
app.use("/api/products", productsRouter);

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Create backend/.env from backend/.env.example.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DATABASE_NAME
    });
    console.log(`Connected to MongoDB Atlas database: ${mongoose.connection.name}.`);

    // Create the database, collection, and initial counter document as soon as the API starts.
    await OrderCounter.findOneAndUpdate(
      { key: COUNTER_KEY },
      {
        $setOnInsert: {
          key: COUNTER_KEY,
          totalOrders: 0,
          productClicks: {
            orangeJuice: 0,
            coconutWater: 0,
            limeJuice: 0
          }
        }
      },
      { new: true, upsert: true }
    );
    await Promise.all([
      OrderCounter.updateOne(
        { key: COUNTER_KEY, "productClicks.orangeJuice": { $exists: false } },
        { $set: { "productClicks.orangeJuice": 0 } }
      ),
      OrderCounter.updateOne(
        { key: COUNTER_KEY, "productClicks.coconutWater": { $exists: false } },
        { $set: { "productClicks.coconutWater": 0 } }
      ),
      OrderCounter.updateOne(
        { key: COUNTER_KEY, "productClicks.limeJuice": { $exists: false } },
        { $set: { "productClicks.limeJuice": 0 } }
      )
    ]);
    console.log("Order counter is ready in the orderCounters collection.");

    app.listen(PORT, "0.0.0.0", () => {
    console.log(`PulpBae API running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
