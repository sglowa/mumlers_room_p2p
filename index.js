/*jshint esversion:6*/

navigator.webkitGetUserMedia({video:true,audio:true},(myStream)=>{
	const Peer = require('simple-peer');
	const peer = new Peer({
		// hmmm, not sure but #init is in the url,
		// checks who initiated the session
		initiator: location.hash === '#init',
		trickle: false,
		stream: myStream
	});

	peer.on('signal', (data)=>{
		document.getElementById('yourId').value = JSON.stringify(data);
	});

	document.getElementById('connect').addEventListener('click', ()=>{
		const otherId = JSON.parse(document.getElementById('otherId').value);
		peer.signal(otherId);
	});

	document.getElementById('send').addEventListener('click', ()=>{
		const yourMessage = document.getElementById("yourMessage").value;
		console.log('o huj');
		peer.send(yourMessage);
	});

	peer.on('data', (data)=>{
		document.getElementById('messages').textContent += data + '\n';
	});	
	peer.on('stream', (theirStream)=>{
		const video1 = document.createElement('video');
		video1.setAttribute('class', 'theirVideo');
		document.body.appendChild(video1);
		// creates the url foe the stream, interesting
		video1.srcObject = theirStream;
		video1.play();
		const video2 = document.createElement('video');
		video2.setAttribute('class', 'myVideo');
		document.body.appendChild(video2);
		video2.srcObject = myStream;
		video2.play();
	});
},(err)=>{
	console.log(err);
});
