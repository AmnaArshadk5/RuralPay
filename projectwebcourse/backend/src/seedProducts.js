const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config({ path: '../.env' });

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ruralpay');

    const admin = await User.findOne({ email: 'admin@ruralpay.com' });
    if (!admin) {
      console.log('Admin user not found. Please run seedAdmin.js first.');
      process.exit(1);
    }

    const products = [
      {
        name: 'Solar Irrigation Pump',
        category: 'Agricultural Equipment',
        price: 45000,
        description: 'High-efficiency solar-powered water pump for sustainable irrigation.',
        imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        retailerId: admin._id,
        stock: 5
      },
      {
        name: 'Energy-Efficient Fridge',
        category: 'Home Appliance',
        price: 32000,
        description: 'Low-power consumption refrigerator designed for rural grids.',
        imageUrl: 'https://images.unsplash.com/photo-1571175432230-01c24844c022?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        retailerId: admin._id,
        stock: 8
      },
      {
        name: 'Electric Seed Drill',
        category: 'Agricultural Equipment',
        price: 15000,
        description: 'Precision seeding tool for small to medium scale farmers.',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        retailerId: admin._id,
        stock: 12
      },
      {
        name: 'Professional Tool Set',
        category: 'Tools',
        price: 8500,
        description: 'Complete set of heavy-duty tools for rural artisans.',
        imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        retailerId: admin._id,
        stock: 20
      }
    ];

    await Product.deleteMany(); // Clear existing
    await Product.insertMany(products);
    
    console.log('Marketplace products seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
