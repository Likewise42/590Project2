const xxh = require('xxhashjs');

let io;

let roomNum = 0;
const rooms = {};
const users = {};

const newRoom = (sock, name) =>{
  const socket = sock;
  console.log(`creating room ${name}`);

  rooms[name] = {
    name: name,
    userNum: 0,
    host: '',
    client: '',
  }

  socket.roomToJoin = rooms[name].title;
}

const joinRoom = (sock, host) =>{
  const socket = sock;

  rooms[socket.roomToJoin].userNum++;
  if(host){
    rooms[socket.roomToJoin].host = socket.name;
  } else{
    rooms[socket.roomToJoin].client = socket.name;
  }

  console.log(`User ${socket.name} is joining room ${rooms[socket.roomToJoin].name}`);
}

const setupSockets = (ioServer) => {
  io = ioServer;

  io.on('connection', (sock) => {
    const socket = sock;

    console.log('user connected');

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    socket.hash = hash;

    socket.on('join', (data)=>{
      socket.roomToJoin = {};
      socket.name = data.name;

      let nameValid = true;

      const keys = Object.keys(users);
      for (let i = 0; i < keys.length; i++) {
        const user = users[keys[i]];
        if(user === socket.name){
          nameValid = false;
        }
      }

      if(nameValid){
        users[socket.name] = socket.name;
        
        socket.emit('nameValid');
        
        console.log(`User ${socket.name} joined the server!`);
      }else{
        socket.emit('nameInvalid');
      }
    });

    socket.on('disconnect', (data) => {
      delete(users[socket.name]);
    });
  });
};

module.exports.setupSockets = setupSockets;
