const express = require('express');
const socketio = require('socket.io')
// const http = require('http'); this is createServer
const router = require('./router.js');
const { createServer } = require('node:http'); //
const { Server } = require("socket.io");
const { addUser, removeUser, getUser, getUsersInRoom } =
  require('./users.js'); // maybe should include user
const PORT = 5000; //  process.env.PORT || 
const app = express();

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });  Not Used

//const httpServer = createServer(app);
const io = new Server(PORT, {
  cors: {
    origin: "http://localhost:3000",
    methods: ['POST, GET']
  }
});
// const io = new Server(httpServer, {
//   path: '/socket.io',
//   allowEIO4: true,
//   cors: {
//     origin: '*'
//   }
// });

// io.use(cors());
// socket.io handles its own cors.. via http server setup above
// const server = http.createServer(app);
// const io = socketio(server); Old ver Cors non compat, trying new one

io.on('connect', (socket) => {
  console.log(`conected to server from client`)
  socket.on('join', (name, room, callback, error) => { // was chat but cl is send jn
    console.log(name, room, 'This is the name/room serverside');
    if (error) return callback(error);

    socket.emit('message', { // down 10lines all name and user were user.name and user.room
      user: 'admin', text: `${name},
    welcome to room ${room}`
    });
    socket.broadcast.to(user.room).emit('message', {
      user: 'admin',
      text: `${name}, has joined!`
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

//app.use(router);
//io.listen(PORT, () => console.log(`IO istening on port ${PORT}`));
//app.listen(PORT, () => console.log(`Server started on ${PORT}`))

