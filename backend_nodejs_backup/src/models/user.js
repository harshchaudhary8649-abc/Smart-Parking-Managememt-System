const { readStore, writeStore } = require("../config/db");

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function findUserByEmail(email) {
  const store = readStore();
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function findUserById(id) {
  const store = readStore();
  return store.users.find((user) => user.id === id);
}

function createUser(user) {
  const store = readStore();
  store.users.push(user);
  writeStore(store);
  return user;
}

module.exports = {
  publicUser,
  findUserByEmail,
  findUserById,
  createUser,
};
