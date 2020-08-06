console.log(location.hash=='#init'?'hello initiator':'hello receiver');


// const socket = io('wss://157.230.114.158:8080', {transports: ['websocket']});
const socket = io();
// const socketId=  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
socket.on('connect',()=>{
	console.log('connected socket !!!');
});


navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

navigator.getUserMedia({video:true,audio:false},(myStream)=>{

// establishing connection (automatic, two peers)
	// me connecting
	const peer = new Peer({
		config: {'iceServers': [
		   { url: 'stun:stun.l.google.com:19302' },
		   { url: 'turn:numb.viagenie.ca?transport=udp',
		   	username: 's9lowacki@gmail.com',
		    credential: 'testingtestint'
		    }
		 ]}
	});
	peer.on('open',  id =>{
		console.log('My peer Id is: ' + id);
		sendPeerId(id);
	});

	//new socket
	socket.on('userConn',data =>{
		//connect to new peer		
		const conn = peer.connect(data.peerId);
		console.log(`connected to peer: ${data.peerId}`);
		helloPeer(conn,'new peer');		
		document.querySelector('div.connection').setAttribute('isConnected', 'true');

		sendMsgEvent(conn);
	});	

	//someone connecting to me
	peer.on('connection', conn =>{
		console.log('peer connected');
		helloPeer(conn,'host');
		document.querySelector('div.connection').setAttribute('isConnected', 'true');

		sendMsgEvent(conn);

		const call = peer.call(conn.peer, myStream, [bounced:false]);
		incomingStream(call);
	});

	const helloPeer = (conn,who) => {
		conn.on('open', function() {
		  console.log('connection open');
		  conn.on('data', data => {
		    console.log('Received', data);
		  });

		  // Send messages
		  conn.send(`Hello, its ${who}!`);
		});
	}

	const sendPeerId = id=>{
		socket.emit('userConn', { peerId: id });		
	};

// exchanging streams 

	// call listener
	peer.on('call', call=>{		
		call.answer(myStream);
		incomingStream(call);
		// bouncingback
		// call.on('stream',bouncedStream=>{
		// 	peer.call()
		// })
	})

	// myStreamA
	const video1a = document.createElement('video');
	video1a.setAttribute('class', 'myVideo');
	document.body.appendChild(video1a);
	video1a.srcObject = myStream;
	video1a.play();
	// myStreamB will be bounced on connection

	const incomingStream = call =>{
		console.log(call);
		call.on('stream', incomingStream =>{
			const video2a = document.createElement('video');
			video2a.setAttribute('class', 'theirVideo');
			document.body.appendChild(video2a);
			video2a.srcObject = incomingStream;
			video2a.play();


			// peer.call(call.peer, incomingStream, [bounced:true]);

		});
	};	
	

// send messages
	
	const sendMsgEvent = conn => {
		document.getElementById('send').addEventListener('click', ()=>{
			const yourMessage = document.getElementById("yourMessage").value;
			// console.log('o huj');
			conn.send(yourMessage);
		});

		conn.on('data', (data)=>{
			document.getElementById('messages').textContent += data + '\n';
		})
	}

},err=>{
	console.log(`user media error: ${err}`);
});



// how i would do it. 
// B wait for new socket, 
// B when socket connected, emit to other sockets
// F1 when other socket connected, create peer
// F1 send peer id over the socket to B
// B relays peer id to new peer 
// F2 takes the F1 peer id, iniiates its own peer,
// F2 sends its own peer id to B
// B relays F2's peer id to F1

// but maybe thats already sorted.. 