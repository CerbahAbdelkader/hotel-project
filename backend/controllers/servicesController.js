const servicesModel = require("../models/servicesModel");

exports.getServices = (req, res) => res.json({ services: servicesModel.getServices() });
exports.getService = (req, res) => {
  const service = servicesModel.getServiceById(parseInt(req.params.id));
  if (!service) return res.status(404).json({ error: "Service not found" });
  res.json({ service });
};
exports.createService = (req, res) => {
  const { name, price } = req.body;
  const service = servicesModel.createService(name, price);
  res.status(201).json({ message: "Service created", service });
};
exports.updateService = (req, res) => {
  const service = servicesModel.updateService(parseInt(req.params.id), req.body);
  if (!service) return res.status(404).json({ error: "Service not found" });
  res.json({ message: "Service updated", service });
};
exports.deleteService = (req, res) => {
  const success = servicesModel.deleteService(parseInt(req.params.id));
  if (!success) return res.status(404).json({ error: "Service not found" });
  res.json({ message: "Service deleted" });
};