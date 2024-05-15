const express = require('express');
const socketio = require('socket.io')
const { createServer, request } = require('node:http');
const router = require('./router.js');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');
// const { clearScreenDown } = require('node:readline');
const PORT = 5000;
const app = express();
const { writeFile } = require('fs');

const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: 1e8,
  cors: {
    origin: "http://localhost:3000",
  }
});

io.on('connection', (socket) => {

  socket.on('join', ({ room, name }, callback) => {
    console.log('Connected user', { name, room }, socket.id);
    addUser(socket.id, name, room)
    // console.log('Connected user got from helper', 
    // getUser(socket.id));
    socket.emit('message', {
      user: 'admin',
      text: `${name}, welcome to room ${room}`
    });
    socket.join(room);
    callback(error => console.log(error));
  });

  socket.on('message', ({ message, name, room,
    type, body, mimeType, fileName }) => {
    const messageObj = type === 'file' ? {
      user: name,
      message: message,
      room: room,
      type: 'file',
      body: body,
      mimeType: mimeType,
      fileName: fileName
    } : {
      user: name,
      text: message,
      room: room
    };
    io.to(room).emit('message', messageObj);
    console.log('Message sent:', messageObj);
  });

  // socket.on('message', ({ message, name, room, type, body, mimeType, fileName }) => {
  //   const messageObj = type === 'file' ? {
  //     user: name,
  //     text: message,
  //     room: room,
  //     type: type,
  //     body: body,
  //     mimeType: mimeType,
  //     fileName: fileName
  //   } : {
  //     user: name,
  //     text: message,
  //     room: room
  //   };

  //   console.log('Message received:', messageObj);
  // });
  // looks identical to above... so no need for it

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

  // socket.on("upload", (file, callback) => {
  //   console.log(file); // <Buffer 25 50 44 ...>
  //   writeFile("/tmp/upload", file, (err) => {
  //     callback({ message: err ? "failure" : "success" });
  //   });
  // });
  // should not be needed

});
httpServer.listen(PORT, () => console.log(`Socket.IO server listening on port ${PORT}`))
