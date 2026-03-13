const mongoose = require('mongoose');

const ConnectDB = async (url) => {
  try {

    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("MongoDB connected");

  } catch (error) {

    console.error("MongoDB connection failed");
    process.exit(1);

  }
};

module.exports = ConnectDB;