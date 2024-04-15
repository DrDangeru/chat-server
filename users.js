const users = [];

function addUser({ id, name, room }) {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.room === room && user.name === name);


  if (existingUser) {
    return { error: 'Username is taken' };
  }

  const user = { id, name, room };
  users.push(user);
  return { user }
}

const removeUser = (id) => {
  const index = users.find((user) => user.id === id);
  if (index) { users.splice(index, 1)[0] }
}

const getUser = (id) => users.find((user) => user.id === id);

function getUsersInRoom(room) {
  users.filter((user) => users.room === room)

}

module.exports = { addUser, removeUser, getUser, getUsersInRoom }