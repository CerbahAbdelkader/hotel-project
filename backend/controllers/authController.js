const authModel = require("../models/authModel");

exports.register = (req, res) => {
  const { username, password } = req.body;
  if (authModel.findUser(username))
    return res.status(400).json({ error: "User already exists" });
  const user = authModel.createUser(username, password);
  res.status(201).json({ message: "User created", user });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = authModel.findUser(username);
  if (!user || user.password !== password)
    return res.status(400).json({ error: "Invalid credentials" });
  res.json({ message: "Login successful", user });
};