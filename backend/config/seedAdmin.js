const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    const admin = await User.findOne({ role: "admin" });

    if (admin) {
      console.log("Admin موجود بالفعل");
      return;
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    const newAdmin = new User({
      name: "Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();

    console.log("تم إنشاء Admin بنجاح");

  } catch (error) {
    console.error("خطأ:", error);
  }
};

module.exports = seedAdmin;