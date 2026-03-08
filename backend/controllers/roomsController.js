const roomsModel = require("../models/roomsModel");

exports.getRooms = (req, res) => {
  res.json({ rooms: roomsModel.getRooms() });
};

exports.getRoom = (req, res) => {
  const room = roomsModel.getRoomById(parseInt(req.params.id));
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ room });
};

exports.createRoom = (req, res) => {
  const { name, capacity, price } = req.body;
  const room = roomsModel.createRoom(name, capacity, price);
  res.status(201).json({ message: "Room created", room });
};

exports.updateRoom = (req, res) => {
  const room = roomsModel.updateRoom(parseInt(req.params.id), req.body);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ message: "Room updated", room });
};

exports.deleteRoom = (req, res) => {
  const success = roomsModel.deleteRoom(parseInt(req.params.id));
  if (!success) return res.status(404).json({ error: "Room not found" });
  res.json({ message: "Room deleted" });
};