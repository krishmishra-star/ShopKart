const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },

  category: {
    type: String,
  },

  price: {
    type: Number,
    required: true,
  },

  owner: {
    type: String,
  },

  image: {
    type: String,
    default: "https://via.placeholder.com/300"
  }

});

module.exports = mongoose.model("Product", productSchema);