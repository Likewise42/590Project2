const xxh = require('xxhashjs');

let io;

const setupSockets = (ioServer) => {
  io = ioServer;

  io.on('connection', (sock) => {
    const socket = sock;
    
    console.log("user joined");

    socket.join('room1');

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    socket.hash = hash;

    socket.on('disconnect', (data)=>{
      
      socket.leave('room1');
    });
  });
}

module.exports.setupSockets = setupSockets;