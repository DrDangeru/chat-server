const express = require('express');
const socketio = require('socket.io')
const router = require('./router.js');
//const { createServer } = require('node:http'); //
//const { Server } = require("socket.io");
const { addUser, removeUser, getUser, getUsersInRoom } =
  require('./users.js'); // maybe should include user
const PORT = 5000; //  process.env.PORT || 
const app = express(); //not used but breaks nothing

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  }
}); //works with or with httpServ 
// io.use((socket, next) => {

// Initialize a Set to store connected users
const connectedUsers = new Set();

io.on('connection', (socket) => {
  socket.on('join', ({ room, name }, callback) => {
    if (connectedUsers.has(socket.id)) {
      // User has already joined, do not proceed
      return;
    }

    console.log(name, room, 'This is the name/room serverside');
    const { user, error } = addUser(socket.id, { name, room });
    console.log('completed add user', user);
    if (error) return callback(error);

    // Add user to connected users
    connectedUsers.add(socket.id);

    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, welcome to room ${room}`
    });

    socket.join(user.room); // Join the room after emitting the message

    console.log(user.name, user.room, 'server joined with these');
    callback(); // Callback after everything is done
  });

  socket.on('sendMessage', (user, message, callback) => {
    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, welcome to room ${user.room}`
    });
    console.log(user, message, callback, 'serverSide send msg ev');
  });

  socket.on('disconnect', (reason, details) => {
    // Remove user from connected users on disconnect
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', {
        text: `${user.name} disconnected`
      })
    }
    connectedUsers.delete(socket.id)
    console.log(reason);
    console.log(details);
  });


  socket.on('sendMessage', (user, message, callback) => {
    console.log(user, message, callback, 'serverSide send msg ev');
    const user = user.name;
    const room = user.room;
    io.to(room).emit('message', { user: user.name, text: message });
    //was user.room
    // callback();
  });

  socket.on('disconnect', (reason, details) => {
    // the reason of the disconnection, for example "transport error"
    console.log(reason);
    console.log(details);
  });
});

// httpServer.use(router);
httpServer.listen(PORT, () => console.log(`IO istening on port ${PORT}`));


