/*jshint esversion:6*/
const socket = io();
socket.on('connect',()=>{
	console.log('connected socket !!!');
});

navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

navigator.getUserMedia({video:{
	width:{ideal:480},
	height:{ideal:360}
},audio:false},myStream=>{
console.log('myStream L', myStream.id);

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

	peer.on('open', id =>{
		console.log('My peer Id is: ' + id);
		const sendPeerId = id=>{
			socket.emit('userConn', { peerId: id });		
		} 
		sendPeerId(id);
	});

	//on new socket
	socket.on('userConn',data =>{
		//outgoing connection		
		const conn = peer.connect(data.peerId);
		console.log(`connected to peer: ${data.peerId}`);
		helloPeer(conn,'new peer');		
		document.querySelector('div.connection').setAttribute('isConnected', 'true');
		hookMsgEvent(conn);
	});	

	//incoming connection
	peer.on('connection', conn =>{
		console.log('peer connected');
		helloPeer(conn,'host');
		document.querySelector('div.connection').setAttribute('isConnected', 'true');
		hookMsgEvent(conn);

// ~~~~~~~~~~~~~~~~~~~~~~~~automated call 

		const callFirst = peer.call(conn.peer, myStream);
		callFirst.on('stream', yourStream=>{
			const callSecond = peer.call(callFirst.peer, yourStream);
			callSecond.on('stream', bouncedStream =>{
				passStreams(myStream,bouncedStream,composite=>{
					const callThird = peer.call(callFirst.peer, composite);
					callThird.on('stream',compositeStream=>{
						passStreamsAllPeers(composite,compositeStream);
					});
				});
				
			});
		});
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
	};

// exchanging streams 

	// call listener - peers sending their own streams
	peer.on('call', call=>{
		console.log('fired 1st call event');
		bounceStreamBack(call);
	});

	const bounceStreamBack = (call)=>{
		call.answer(myStream);
		// here im sending yourStream back to you
		call.on('stream', yourStream=>{

			peer.off('call');
			peer.on('call',call=>{
				call.answer(yourStream);
				call.on('stream',bouncedStream=>{		
					peer.off('call');
					passStreams(myStream,bouncedStream,composite=>{
						peer.on('call',call=>{
							call.answer(composite);
							call.on('stream',composite_incoming=>{
								passStreamsAllPeers(composite,composite_incoming);
							});
						});
					});					
				});
			});
		});
	};

	const passStreams = (origin_str,bounced_str,callback)=>{
		const videocontext_userComposite = require('./videocontext_userComposite.js');
		videocontext_userComposite(origin_str,bounced_str,(canvas)=>{
			callback(canvas.captureStream());
		});			
	};

	const passStreamsAllPeers = (myComposite, yourComposite)=>{
		const videocontext_allUsersComposite = require('./videocontext_allUsersComposite.js');
		videocontext_allUsersComposite(myComposite, yourComposite,(canvas)=>{
			document.body.appendChild(canvas);
		});
	};


	// const displayBouncedStream = stream => {
	// 	const video1b = document.createElement('video');
	// 	video1b.setAttribute('class', 'bouncedVideo');
	// 	document.body.appendChild(video1b);
	// 	video1b.srcObject = stream;
	// 	video1b.play();
	// }

	// // myStreamorigin
	// const video1a = document.createElement('video');
	// video1a.setAttribute('class', 'myVideo');
	// document.body.appendChild(video1a);
	// video1a.srcObject = myStream;
	// video1a.play();
	// // myStreamB will be bounced on connection


// ▼▼ send messages ▼▼
	
	const hookMsgEvent = conn => {
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

