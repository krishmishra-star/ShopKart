require("dotenv").config();

const express = require("express");
const cors = require("cors");
const ProductRoutes = require("./routes/productRoutes");
const connectDb = require("./config/db");
const OrderRoutes = require("./routes/Orderroutes");
const app = express();

connectDb();

app.use(cors());
app.use(express.json());
app.use("/api/products", ProductRoutes); 
app.use("/api/orders", OrderRoutes);

app.get("/", (req, res) => {
  res.send("server is running");
});

const Port = process.env.PORT || 2005;
app.listen(Port, () => {
  console.log(`Server is running on port ${Port} `);
});