const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    return conn.connection.db;
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1); 
  }
};

module.exports = connectDB;
