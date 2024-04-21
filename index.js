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
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   socket.username = username;
//   next();
// });

io.on('connection', (socket) => {
  socket.broadcast.emit('hi'); // socket.on deprecated
  // socket broadcast does nothing as we have not 
  // connected to any namespace. emit likewise.
  // Probably nothing on client side to handle this comms.
  // 
  socket.on('join', ({ room, name }, callback) => {// was chat but cl is send 
    console.log(name, room, 'This is the name/room serverside');
    const { error, user } = addUser({ id: socket.id, name: name, room: room });
    console.log('completed add user', user);
    if (error) return callback(error);

    socket.emit('message', {
      user: 'admin', text:
        `${user.name}, welcome to room ${room}`
    });
    socket.broadcast.to(user.room).emit('message', {
      user: 'admin',
      text: `${user.name}, has joined!`
    })
    socket.join(user.room);
    console.log(user.name, user.room, 'server joined with these');
    callback(); // everytime callback is sent to frontend
    //with or w/out error this is end of join handling
    // other functions are separated but in the io.on closure
  });

  socket.on('sendMessage', ({ user, message }, callback) => {
    console.log(user, message, callback, 'serverSide send msg ev');
    // const user = getUser(user.id); ^disconnects without user tr.'name'
    // const room = user.room;
    // io.to(room).emit('message', { user: user.name, text: message });
    //was user.room
    // callback();
  });

  socket.on('disconnect', (reason, details) => {
    // the reason of the disconnection, for example "transport error"
    console.log(reason);
    console.log(details);
  });
});
//app.use(router);
httpServer.listen(PORT, () => console.log(`IO istening on port ${PORT}`));
//app.listen(PORT, () => console.log(`Server started on ${PORT}`))

