const xxh = require('xxhashjs');

let io;


const users = {};


const rooms = {};
const newRoom = (name) => {
	console.log(`creating room ${name}`);

	if(rooms[name]){
		console.log('room already exists. this should never be called');
	} else{
		rooms[name] = {
			name,
			host: '',
			client: '',
		};
		console.dir(rooms[name]);
	}

};

const hostRoom = (sock) => {
	const socket = sock;
	//if someone else is already hosting the room
	if(rooms[socket.roomToJoin]){
		socket.emit('roomAlreadyHosted');
		socket.roomToJoin = '';
	}else{
		console.log(`User ${socket.name} is hosting room ${socket.roomToJoin.name}`);

		newRoom(socket.roomToJoin);
		
		rooms[socket.roomToJoin].host = socket.name;
		socket.join(socket.roomToJoin);
		socket.emit('roomHosted',socket.roomToJoin);
	}
}

const joinRoom = (sock) => {
	const socket = sock;

	rooms[socket.roomToJoin].client = socket.name;
	console.log(`User ${socket.name} is joining room ${rooms[socket.roomToJoin].name}`);

};

const roomSockets = (sock) =>{
	const socket = sock;

	socket.on('hostRoom', (data) =>{
		socket.roomToJoin = data.name;
		hostRoom(socket);
	});
}

const setupSockets = (ioServer) => {
	io = ioServer;

	io.on('connection', (sock) => {
		const socket = sock;

		console.log('user connected');

		const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

		socket.hash = hash;

		socket.on('join', (data) => {
			socket.roomToJoin = {};
			socket.name = data.name;

			roomSockets(socket);

			let nameValid = true;

			const keys = Object.keys(users);
			for (let i = 0; i < keys.length; i++) {
				const user = users[keys[i]];
				if (user === socket.name) {
					nameValid = false;
				}
			}

			if (nameValid) {
				users[socket.name] = socket.name;

				socket.emit('nameValid');

				console.log(`User ${socket.name} joined the server!`);
			} else {
				socket.emit('nameInvalid');
			}
		});

		socket.on('disconnect', () => {
			console.log(`User ${socket.name} left the server!`);
			delete (users[socket.name]);
		});
	});
};

module.exports.setupSockets = setupSockets;
