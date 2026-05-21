const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  customerName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  pincode: {
    type: String,
    required: true,
  },

  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    }
  ],

  totalPrice: {
    type: Number,
    required: true,
  },

  paymentStatus: {
    type: String,
    default: "Pending",
  },

  status: {
    type: String,
    default: "Ready for Shipping",
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model("Order", orderSchema);