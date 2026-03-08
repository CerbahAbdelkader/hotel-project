const rooms = [
  { id: 1, name: "Single Room", capacity: 1, price: 50 },
  { id: 2, name: "Double Room", capacity: 2, price: 80 },
  { id: 3, name: "Suite", capacity: 4, price: 150 }
];

const getRooms = () => rooms;

const getRoomById = (id) => rooms.find(r => r.id === id);

const createRoom = (name, capacity, price) => {
  const newRoom = { id: rooms.length + 1, name, capacity, price };
  rooms.push(newRoom);
  return newRoom;
};

const updateRoom = (id, data) => {
  const room = rooms.find(r => r.id === id);
  if (!room) return null;
  Object.assign(room, data);
  return room;
};

const deleteRoom = (id) => {
  const index = rooms.findIndex(r => r.id === id);
  if (index === -1) return false;
  rooms.splice(index, 1);
  return true;
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};