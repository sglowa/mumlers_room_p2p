/*jshint esversion:6*/
const getUserMedia = require('./helpers.js').getUserMedia;
const makeEmptyStream = require('./helpers.js').makeEmptyStream;
const changeTracks = require('./helpers').changeTracks;
let peer;
let stream;


const hookCalls=(peer)=>{	
	peer.on('call', call=>{
		console.log(call);
		const emptyStream = makeEmptyStream({width:640,height:480});
		call.answer(emptyStream);
		call.on('stream', yourStream=>{
			const vTrack = yourStream.getVideoTracks()[0];
			const aTrack = yourStream.getAudioTracks()[0];
			if(vTrack) changeTracks(call.peerConnection,vTrack);
			if(aTrack) changeTracks(call.peerConnection,aTrack);
			//swap emptyStream track with yourStream;
		})
	});
}
		
const initPeer = ()=>{
	return new Promise((resolve,reject)=>{
		peer = new Peer({
			config: {'iceServers': [
			   { url: 'stun:stun.l.google.com:19302' },
			   { url: 'turn:numb.viagenie.ca?transport=udp',
			   	username: 's9lowacki@gmail.com',
			    credential: 'testingtestint'
			    }
			 ]}
		});

		peer.on('open', id=>{
			console.debug("i am", peer);
			console.debug("my id is:", id);
			hookCalls(peer);
			resolve(peer);
		})
		setTimeout(()=>{
			reject(new Error('peer connection timeout'));
		},3000)
	})
}

// const initPeer = ()=>{
// 	const peer = new Peer({
// 		config: {'iceServers': [
// 		   { url: 'stun:stun.l.google.com:19302' },
// 		   { url: 'turn:numb.viagenie.ca?transport=udp',
// 		   	username: 's9lowacki@gmail.com',
// 		    credential: 'testingtestint'
// 		    }
// 		 ]}
// 	});

// 	peer.on('open', id =>{
// 		console.debug("i am", peer, "my id is:" id);
// 		// socket.emit('peerInit', { peerId: id }); // i should chain socket events in another js
// 	});	
// 	return peer.id;
// }

callPartner = (partner_id)=>{
	
	getUserMedia()
		.then(stream=>{
			const call_1 = peer.call(partner_id,stream);
			call_1.on('stream',yourStream=>{
				console.log('received stream from partner', yourStream);
			})
		}).catch(err=>{
			console.error(err);
		})

	
}
module.exports = {
	initPeer,
	callPartner
}
