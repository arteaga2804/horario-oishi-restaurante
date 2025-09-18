const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
  } catch (err) {
    console.error(`Error connecting to DB: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
