const express = require('express');
const socketio = require('socket.io')
const { createServer } = require('node:http');
const router = require('./router.js');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');
// const { clearScreenDown } = require('node:readline');
const PORT = 5000;
const app = express();

const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  }
});


io.on('connection', (socket) => {
  // console.log('A user connected');
  // socket.broadcast.emit("hello", "from the admin");
  socket.on('join', ({ room, name }, callback) => {
    console.log('Connected user', { name, room }, socket.id);
    addUser(socket.id, name, room)
    console.log('Connected user got from helper', getUser(socket.id));
    socket.emit('message', {
      user: 'admin',
      text: `${name}, welcome to room ${room}`
    });
    socket.join(room);
    callback(error => console.log(error));
  });

  socket.on('sendMessage', ({ message, name, room }) => {
    io.to(room).emit('message', {
      user: name,
      text: message,
      room: room
    });
  });

  socket.on('message', ({ message, name }) => {
    io.to(room).emit('message',
      {
        user: name, // message.user
        text: message.text, // `${message}`
        room: room
      });

  });


  socket.on('disconnect', (reason) => {
    console.log('A user disconnected');
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', {
        user: 'admin',
        text: `${user.name} has left the chat`
      });
    }
  });


});
httpServer.listen(PORT, () => console.log(`Socket.IO server listening on port ${PORT}`))
