use('ecommerce');

db.getCollection('products').insertMany([
  {
    "name": "T-shirt",
    "category": "Shirts",
    "price": 1700,
    "owner": "Trendz",
    "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
  },
  {
    "name": "Smart Watch",
    "category": "Electronics",
    "price": 4500,
    "owner": "TechZone",
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
  }
]);