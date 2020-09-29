/*jshint esversion:6*/
let io = require('socket.io');
const helpers = require('./helpers.js');
let roomArr = [];

//for finding room on socket disconnect 
// const findRoom_bySocket = (socket_id)=>{
// 	const room = roomArr.filter(room=>room.members.includes({}socket_id));
// 	const room = roomArr.filter(room=>{
// 		for (member of room.members) {
// 		 	return member.socket_id === socket_id ? true ; false// statement
// 		 } room.members
// 	});
// 	if (!room.length) console.error("socket doesn't belong to a room");
// 	if (room.length>1) console.error(`socket belongs to multiple rooms: ${room}`);
// 	if (room.length) return room[0];
// 	return false;
// };

const findRoom_byName = (name)=>{
	const room = roomArr.filter(room=>room.name == name);
	if (!room.length) console.error(`no room named ${name}`);
	if (room.length>1) console.error(`multiple rooms named ${name}`);
	if (room.length) return room[0];
	return false;
}

const init_io = (server)=>{
	io = io(server,{
		pingTimeout: 60000
	});
	console.log('io initialized');
	io.on('connection', socket =>{
		console.log('socket connected');
	});
};

const checkRoom = (name)=>{	
	const isValidated = helpers.validateInput(name);
	if(!isValidated) return {isAccepted:false, err:`name invalid : ${name}`};
	const isSanitized = helpers.sanitizeInput(name);
	if(!isSanitized) return {isAccepted:false, err:`name dirty : ${name}`};
	let isTaken = roomArr.filter(room=>room.name===name);
	isTaken = isTaken.length > 0 ? true : false;
	if(isTaken){
		return {isAccepted:true, isTaken:true};
	}else{
		return {isAccepted:true, isTaken:false};
	}
};

const joinRoom = (name,socket_id)=>{
	const room = findRoom_byName(name);
	room.addPeer(socket_id);
}

class Room {
	constructor(name,socket_id){
		this.name = name;
		this.members = [];
		this.addPeer(socket_id);
		roomArr.push(this); // initing io room
	};

	hookDisconnect = (socket_rm)=>{
		socket_rm = typeof socket_rm === 'string' ? io.of('/').connected[`${socket_rm}`] : socket_rm;
		socket_rm.on('disconnecting', socket=>{
			if(socket_rm.rooms[this.name]!===this.name){
				console.error(`socket does not belong to room ${this.name}`);	
			}else{
				this.removePeer(socket_rm);
				console.debug(`${socket_rm} disconnected from ${this}`);
			};
		});
	};

	addPeer = (socket_add)=>{
		socket_add = typeof socket_add === 'string' ? io.of('/').connected[`${socket_add}`] : socket_add;
		socket_add.join(this.name);
		this.hookDisconnect(socket_add);
		this.members.push(socket_add);
		io.to(socket_add.id).emit('roomEntered',{name:this.name});
		// 1. let socket know it entered the room, (via post res or socket).
		// 2. client creates a peer, sends the socket emit (peer_id)
		// 3. server broadcast peer_id to everone else in the room

		// now, peering happens all on client side, remember
	};
	removePeer = (socket_rm)=>{
		socket_rm = typeof socket_rm === 'string' ? io.of('/').connected[`${socket_rm}`] : socket_rm;
		this.members = this.members.filter(socket => socket !== socket_rm);
		// socket.io removes disconnected socket from rooms automatically 
		// closePeerConnection
		if(this.members.length === 0 ) this.closeRoom();
	};
	closeRoom = ()=>{
		roomArr = roomArr.filter(room => room !== this); // removing the only ref so should be garbage collected.
	};
};

module.exports = {
	init_io,
	checkRoom,
	joinRoom,
	Room,	
};


/*
const peer_rooms = (server)=>{
	io = io(server);

	io.on('connection', socket =>{
		console.log('socket connected',socket);
		socket.on('userConnec',(data)=>{
			socket.broadcast.emit('userConn',data);
		});
	});
};
*/
