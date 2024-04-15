const express = require('express');
const socketio = require('socket.io')
// const http = require('http'); this is createServer
const router = require('./router.js');
const { createServer } = require('node:http');
const { Server } = require("socket.io");
const { addUser, removeUser, getUser, getUsersInRoom } =
  require('./users.js');
// const cors = require('cors');
const PORT = 5000; //  process.env.PORT || 
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  allowEIO3: true,
  cors: {
    origin: '*'
  }
});
// io.use(cors());
// socket.io handles its own cors.. via http server setup above
// const server = http.createServer(app);
// const io = socketio(server); Old ver Cors non compat, trying new one

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    console.log(name, room, 'This is the name/room serverside');
    if (error) return callback(error);

    socket.emit('message', {
      user: admin, text: `${user.name},
    welcome to room ${user.room}`
    });
    socket.broadcast.to(user.room).emit('message', {
      user: 'admin',
      text: `${user.name}, has joined!`
    })
    socket.join(user.room, user.name);
    console.log(user.name, user.room, 'server joined with these');
    callback(); // everytime callback is sent to frontend
    //with or w/out error
    // this is end of join handling
    // other functions are separated but in the io.on closure
  });
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('message', { user: user.name, text: message });
    callback();
  });

  socket.on('disconnect', () => { //server auto recieves noti/disc
    console.log('user disconnected!!!');
  });
});

app.use(router);
//io.listen(PORT, () => console.log(`IO istening on port ${PORT}`));
app.listen(PORT, () => console.log(`Server started on ${PORT}`))

