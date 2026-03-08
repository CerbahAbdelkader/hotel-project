const express = require("express");
const router = express.Router();
const roomsController = require("../controllers/roomsController");

router.get("/", roomsController.getRooms);
router.get("/:id", roomsController.getRoom);
router.post("/", roomsController.createRoom);
router.put("/:id", roomsController.updateRoom);
router.delete("/:id", roomsController.deleteRoom);

module.exports = router;