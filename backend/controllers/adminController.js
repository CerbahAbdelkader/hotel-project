// backend/controllers/adminController.js
const admins = require("../models/adminModel");

// Get all admins
exports.getAllAdmins = (req, res) => {
  res.json({ admins });
};

// Get single admin
exports.getAdminById = (req, res) => {
  const admin = admins.find(a => a.id === parseInt(req.params.id));
  if (!admin) return res.status(404).json({ error: "Admin not found" });
  res.json({ admin });
};

// Create new admin
exports.createAdmin = (req, res) => {
  const { name, email, password } = req.body;
  const newAdmin = { id: admins.length + 1, name, email, password };
  admins.push(newAdmin);
  res.status(201).json({ message: "Admin created", admin: newAdmin });
};

// Update admin
exports.updateAdmin = (req, res) => {
  const admin = admins.find(a => a.id === parseInt(req.params.id));
  if (!admin) return res.status(404).json({ error: "Admin not found" });
  Object.assign(admin, req.body);
  res.json({ message: "Admin updated", admin });
};

// Delete admin
exports.deleteAdmin = (req, res) => {
  const index = admins.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Admin not found" });
  admins.splice(index, 1);
  res.json({ message: "Admin deleted" });
};