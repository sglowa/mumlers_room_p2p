/*jshint esversion:6*/
const roomForm = require('./roomForm.js');
const calls = require('./calls2.js');
//o chuj chodzi
const socket = io();
socket.on('connect',()=>{
	console.log('connected socket !!!');
});

let peer;

socket.on('roomEntered',async (data)=>{
	alert(`entered into room ${data.name}`);
	try {
		let peer = await calls.initPeer(); // !! i should promisify this < 
		socket.emit('peerInit',{peer_id:peer.id});
	} catch(err) {
		console.error(err)
	}
})

socket.on('newPartner',data=>{
	console.log(`my partners peerId is :${data.peer}`);
	calls.callPartner(data.peer);
	// now the new one has to call the first one (always the case )
	// break connection with previous pratner < see how to break existing connection in peerJS 
	// init the bounce call with new partner
	// FIRST > just establish connection between two. 

	//now check if there are existing connections, break if so 
	// but shouldnt ask getUserMedia everytime, existing streams should be reused.
})

socket.on('peerLeft',data=>{
	// data < data about peer that left
	// + about substitute peer 
	// sent only to affected peers (n-1 && n+1).

	// but also to all to stop streaming composites  
})

roomForm(socket);

//move all the socket events to socketEvents.js




