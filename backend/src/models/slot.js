const { readStore, writeStore } = require("../config/db");

function listSlots() {
  return readStore().slots;
}

function findSlotById(id) {
  return readStore().slots.find((slot) => slot.id === id);
}

function saveSlot(slot) {
  const store = readStore();
  const index = store.slots.findIndex((item) => item.id === slot.id);

  if (index >= 0) {
    store.slots[index] = slot;
  } else {
    store.slots.push(slot);
  }

  writeStore(store);
  return slot;
}

function deleteSlot(id) {
  const store = readStore();
  const before = store.slots.length;
  store.slots = store.slots.filter((slot) => slot.id !== id);
  writeStore(store);
  return before !== store.slots.length;
}

module.exports = {
  listSlots,
  findSlotById,
  saveSlot,
  deleteSlot,
};
