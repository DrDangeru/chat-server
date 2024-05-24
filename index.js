const express = require('express');
const socketio = require('socket.io')
const { createServer, request } = require('node:http');
const router = require('./router.js');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');
// const { clearScreenDown } = require('node:readline');
const PORT = 5000;
const app = express();
const { writeFile } = require('fs');
const Database = require('better-sqlite3');

const db = new Database('chatDb.db', { verbose: console.log });

const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: 1e8,
  cors: {
    origin: "http://localhost:3000",
  }
});

let date = new Date().toISOString().slice(0, 18);
const createDb = `CREATE TABLE IF NOT EXISTS chatDb(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TIMESTAMP NOT NULL,
  room VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL
)`;
db.exec(createDb);
db.pragma('journal_mode = WAL');


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

    const stmt = db.prepare(`INSERT INTO chatDb (date, room, name, message) VALUES (?, ?, ?, ?)`);
    stmt.run(date, room, name, message);
    // db.close();
    // db.exec(`INSERT INTO chatDb (date, room, name, message),
    //   VALUES(?,?,?,?), ('${date}', '${room}', '${name}', '${text}') `);
  });


  socket.on('search', (params) => { // 

    try {
      const { date } = params; //name, room, message

      console.log('date', date);

      const query = `
    SELECT * FROM chatDb 
    WHERE date LIKE 'date%'
`;


      // AND(name = ? OR ? IS NULL)`


      //   SELECT * FROM chatDb 
      //   WHERE 
      //     date = COALESCE(?, date) 
      //     OR name = COALESCE(?, name) 
      //     OR room LIKE COALESCE(?, room) 
      //     OR message LIKE COALESCE(?, message)
      // `;

      const searcha = db.prepare(query);

      const results = searcha.all(date ? `${date}%` : null);
      // name ? `%${name}%` : null,
      // room ? `%${room}%` : null,
      // message ? `%${message}%` : null);

      io.to(room).emit('searchResults', results);
      console.log('searchResults', results);
    } catch (error) {
      console.error('Database query failed:', error);
      socket.emit('searchError', { error: 'Database query failed' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('A user disconnected');
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', {
        user: 'admin',
        text: `${user.name} has left the chat`// was w/out reason
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

//search
// const room = room;
// const stmt = db.prepare('SELECT * FROM chatDb WHERE room = ?');
// const rows = stmt.all(room);

// console.log(rows);

httpServer.listen(PORT, () => console.log(`Socket.IO server listening on port ${PORT}`))
