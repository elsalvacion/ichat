const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to db");
  } catch (err) {
    console.log("Database error");
  }
};

module.exports = connectDB;
