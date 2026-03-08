const users = [
  { id: 1, username: "admin", password: "123456" },
  { id: 2, username: "alice", password: "password" }
];

const getUsers = () => users;
const createUser = (username, password) => {
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);
  return newUser;
};
const findUser = (username) => users.find(u => u.username === username);

module.exports = { getUsers, createUser, findUser };