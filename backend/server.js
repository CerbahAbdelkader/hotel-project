const express = require("express");
const cors = require("cors");

const roomsRoutes = require("./routes/roomsRoutes");
const bookingsRoutes = require("./routes/bookingsRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const servicesRoutes = require("./routes/servicesRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/rooms", roomsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hotel backend running");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));