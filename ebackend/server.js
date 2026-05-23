require("dotenv").config();

const express = require("express");
const cors = require("cors");

const ProductRoutes = require("./routes/productRoutes");
const OrderRoutes = require("./routes/orderRoutes");
const connectDb = require("./config/db");

const app = express();

// Connect Database
connectDb();

// Middleware
app.use(
  cors({
  origin: ["https://your-project.vercel.app", "https://krishshop.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
})
);

app.use(express.json());

// Routes
app.use("/api/products", ProductRoutes);
app.use("/api/orders", OrderRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start Server
const PORT = process.env.PORT || 2005;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});