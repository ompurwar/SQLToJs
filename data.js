
let products = [
    {"id":1, "name": "Smartphone", "category": "Electronics", "price": 599.99, "manufacturer": "Samsung", "description": "The latest smartphone from Samsung with a 6.5 inch OLED display and 5G connectivity.", },
    {"id":2, "name": "Laptop", "category": "Electronics", "price": 1299.99, "manufacturer": "Apple", "description": "A powerful laptop from Apple with a 13 inch Retina display and an M1 chip." },
    {"id":3, "name": "Smartwatch", "category": "Electronics", "price": 199.99, "manufacturer": "Fitbit", "description": "A fitness-focused smartwatch from Fitbit with heart rate monitoring and GPS." },
    {"id":4, "name": "Sneakers", "category": "Footwear", "price": 89.99, "manufacturer": "Nike", "description": "A stylish and comfortable pair of sneakers from Nike, perfect for everyday wear." },
    {"id":5, "name": "Backpack", "category": "Accessories", "price": 49.99, "manufacturer": "Herschel", "description": "A sturdy and stylish backpack from Herschel, great for school or travel." },
    {"id":6, "name": "Blender", "category": "Kitchen Appliances", "price": 79.99, "manufacturer": "Vitamix", "description": "A powerful blender from Vitamix, perfect for making smoothies and soups." },
    {"id":7, "name": "Dumbbells", "category": "Fitness Equipment", "price": 49.99, "manufacturer": "Bowflex", "description": "A set of adjustable dumbbells from Bowflex, great for home workouts." },
    {"id":8, "name": "Gaming Mouse", "category": "Gaming Accessories", "price": 69.99, "manufacturer": "Logitech", "description": "A high-performance gaming mouse from Logitech with customizable RGB lighting." },
    {"id":9, "name": "Headphones", "category": "Electronics", "price": 149.99, "manufacturer": "Sony", "description": "A wireless noise-cancelling headphones from Sony, perfect for music and podcasts." },
    {"id":10, "name": "Smart Thermostat", "category": "Home Appliances", "price": 199.99, "manufacturer": "Nest", "description": "A smart thermostat from Nest that learns your preferences and can be controlled remotely." },
    {"id":11, "name": "T-Shirt", "category": "Clothing", "price": 19.99, "manufacturer": "Uniqlo", "description": "A soft and comfortable t-shirt from Uniqlo, available in various colors and sizes." },
    {"id":12, "name": "Wireless Charger", "category": "Electronics", "price": 600, "manufacturer": "Belkin", "description": "A wireless charger from Belkin, compatible with most smartphones and tablets." },
    {"id":13, "name": "M1 macbook", "category": "Electronics", "price": 799.99, "manufacturer": "Apple", "description": "A powerful laptop from Apple with a 13 inch Retina display and an M1 chip." }]
const users = [
    { id: 1, budget: 564, name: 'User 1', marks: 85 },
    { id: 2, budget: 319, name: 'User 2', marks: 47 },
    { id: 3, budget: 713, name: 'User 3', marks: 92 },
    { id: 4, budget: 498, name: 'User 4', marks: 60 },
    { id: 5, budget: 904, name: 'User 5', marks: 77 },
    { id: 6, budget: 268, name: 'User 6', marks: 34 },
    { id: 7, budget: 138, name: 'User 7', marks: 89 },
    { id: 8, budget: 849, name: 'User 8', marks: 55 },
    { id: 9, budget: 756, name: 'User 9', marks: 72 },
    { id: 10, budget: 502, name: 'User 10', marks: 95 },
];
// Order table
const orders = [
    { id: 1, user_id: 5, product_id: 1, quantity: 1 },
    { id: 2, user_id: 2, product_id: 3, quantity: 2 },
    { id: 3, user_id: 9, product_id: 8, quantity: 1 },
    { id: 4, user_id: 4, product_id: 5, quantity: 3 },
    { id: 5, user_id: 10, product_id: 2, quantity: 1 },
    { id: 6, user_id: 1, product_id: 6, quantity: 1 },
    { id: 7, user_id: 7, product_id: 10, quantity: 2 },
    { id: 8, user_id: 3, product_id: 12, quantity: 1 },
    { id: 9, user_id: 8, product_id: 9, quantity: 1 },
    { id: 10, user_id: 6, product_id: 4, quantity: 1 },
];

// Payment table
const payments = [
    { id: 1, order_id: 1, amount: 599.99, payment_method: "Credit Card", status: "Paid" },
    { id: 2, order_id: 2, amount: 399.98, payment_method: "PayPal", status: "Paid" },
    { id: 3, order_id: 3, amount: 69.99, payment_method: "Apple Pay", status: "Paid" },
    { id: 4, order_id: 4, amount: 269.97, payment_method: "Google Pay", status: "Paid" },
    { id: 5, order_id: 5, amount: 1299.99, payment_method: "Credit Card", status: "Paid" },
    { id: 6, order_id: 6, amount: 79.99, payment_method: "Credit Card", status: "Paid" },
    { id: 7, order_id: 7, amount: 399.98, payment_method: "PayPal", status: "Pending" },
    { id: 8, order_id: 8, amount: 600, payment_method: "Credit Card", status: "Pending" },
    { id: 9, order_id: 9, amount: 149.99, payment_method: "Credit Card", status: "Failed" },
    { id: 10, order_id: 10, amount: 89.99, payment_method: "Credit Card", status: "Paid" },
];


export {
    products, users,orders,payments
}