// db.js
const mongoose = require('mongoose');
require('dotenv').config();

const db = process.env.DATABASE;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('DB connection successful');
  } catch (err) {
    console.error('DB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
