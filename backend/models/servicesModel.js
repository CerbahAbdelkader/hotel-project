const services = [
  { id: 1, name: "Room Cleaning", price: 20 },
  { id: 2, name: "Spa", price: 50 }
];

const getServices = () => services;
const getServiceById = (id) => services.find(s => s.id === id);
const createService = (name, price) => {
  const newService = { id: services.length + 1, name, price };
  services.push(newService);
  return newService;
};
const updateService = (id, data) => {
  const service = services.find(s => s.id === id);
  if (!service) return null;
  Object.assign(service, data);
  return service;
};
const deleteService = (id) => {
  const index = services.findIndex(s => s.id === id);
  if (index === -1) return false;
  services.splice(index, 1);
  return true;
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};