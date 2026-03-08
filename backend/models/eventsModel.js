const events = [
  { id: 1, title: "Live Music Night", date: "2026-03-10" },
  { id: 2, title: "Wine Tasting", date: "2026-03-12" }
];

const getEvents = () => events;
const getEventById = (id) => events.find(e => e.id === id);
const createEvent = (title, date) => {
  const newEvent = { id: events.length + 1, title, date };
  events.push(newEvent);
  return newEvent;
};
const updateEvent = (id, data) => {
  const event = events.find(e => e.id === id);
  if (!event) return null;
  Object.assign(event, data);
  return event;
};
const deleteEvent = (id) => {
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return false;
  events.splice(index, 1);
  return true;
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};