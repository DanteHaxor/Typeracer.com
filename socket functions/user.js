let users = [];

function userjoin(id, username, room) {
  const roomUsers = users.filter((u) => u.room === room);
  if (roomUsers.length >= 4) {
    return "";
  }
  const user = { id, username, room };
  users.push(user);
  return user;
}

function getRoomuser(room) {
  return users.filter((u) => u.room === room);
}

function deleteuser(user) {
  const index = users.findIndex((ele) => ele.username === user);
  if (index !== -1) {
    users.splice(index, 1);
  }
}

module.exports = { userjoin, getRoomuser, deleteuser };
