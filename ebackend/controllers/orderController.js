const Order = require("../models/Order");

const createOrder = async (req, res) => {

  try {

    const newOrder = new Order(req.body);

    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
};