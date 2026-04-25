const mongoose =require('mongoose')
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const ConnectDB = async (URI) => {
  try {
    // include recommended connection options
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('connected to database');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // propagate the error so the caller (server.js) can handle it
    throw error;
  }
};

module.exports = ConnectDB;