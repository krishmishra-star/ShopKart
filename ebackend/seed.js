const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/product");

const productsData = [
  { name: "Running Sneaker",   price: 1999, image: "shoes/1.jpg",    category: "shoes", owner: "Nike" },
  { name: "Classic Sneaker",   price: 2499, image: "shoes/2.jpg",    category: "shoes", owner: "Adidas" },
  { name: "Premium Watch",     price: 2999, image: "watches/1.jpg",  category: "watches", owner: "Rolex" },
  { name: "Classic Watch",     price: 1999, image: "watches/2.jpg",  category: "watches", owner: "Titan" },
  { name: "Casual Jacket",     price: 3999, image: "men wear/1.jpg", category: "fashion", owner: "Zara" },
  { name: "Formal Shirt",      price: 1299, image: "men wear/2.jpg", category: "fashion", owner: "Levi's" },
  { name: "Mechanical Keyboard", price: 4599, image: "keyboard/1.jpg", category: "electronics", owner: "Logitech" },
  { name: "Gaming Keyboard",   price: 3999, image: "keyboard/2.jpg", category: "electronics", owner: "Razer" },
  { name: "Premium Purse",     price: 3499, image: "purse/1.jpg", category: "fashion", owner: "Gucci" },
  { name: "Everyday Purse",   price: 1499, image: "purse/2.jpg", category: "fashion", owner: "Fossil" },
  { name: "Smart Watch",      price: 4999, image: "watches/3.jpg", category: "watches", owner: "Apple" },
  { name: "Sports Shoe",      price: 2499, image: "shoes/3.jpg", category: "shoes", owner: "Puma" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding");

    await Product.deleteMany({});
    console.log("Cleared existing products");

    await Product.insertMany(productsData);
    console.log("Successfully seeded products");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
};

seedDB();
