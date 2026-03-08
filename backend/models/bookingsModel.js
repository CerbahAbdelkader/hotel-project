const bookings = [
  { id: 1, roomId: 1, user: "Alice", date: "2026-03-08", nights: 2 },
  { id: 2, roomId: 2, user: "Bob", date: "2026-03-09", nights: 1 }
];

const getBookings = () => bookings;
const getBookingById = (id) => bookings.find(b => b.id === id);
const createBooking = (roomId, user, date, nights) => {
  const newBooking = { id: bookings.length + 1, roomId, user, date, nights };
  bookings.push(newBooking);
  return newBooking;
};
const updateBooking = (id, data) => {
  const booking = bookings.find(b => b.id === id);
  if (!booking) return null;
  Object.assign(booking, data);
  return booking;
};
const deleteBooking = (id) => {
  const index = bookings.findIndex(b => b.id === id);
  if (index === -1) return false;
  bookings.splice(index, 1);
  return true;
};

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};