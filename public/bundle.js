(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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


},{"./videocontext_allUsersComposite.js":3,"./videocontext_userComposite.js":4}],2:[function(require,module,exports){
/*jshint esversion:6*/
const testEffectDescription = {
    title:"test",
    description: "Change images to a single chroma (e.g can be used to make a black & white filter). Input color mix and output color mix can be adjusted.",
    vertexShader : `        
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        // ^^ attribute is vertex shader only, its user defined data input,
        // in raw webgl data is fed using buffer object (as in webgl_trial.js)
        varying vec2 v_texCoord;
        // in recent versions of glsl, varying == output of vertexShader && input of fragment shader.
        // so it looks its used to pass data between shaders
        void main() {
            gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0); // <- normalizing
            // since clip space goes from -1.0 to 1.0, and our u_image dims are 0.0 to 1.0 on both axis
            // we multiply both xy by 2.0 and move both by -1.0
            v_texCoord = a_texCoord;
        }`,
    fragmentShader : `
        precision mediump float;
        uniform sampler2D u_image;
        uniform vec3 inputMix;
        uniform vec3 outputMix;
        varying vec2 v_texCoord;
        varying float v_mix;
        void main(){
            vec4 color = texture2D(u_image, v_texCoord);
            float mono = color[0]*inputMix[0] + color[1]*inputMix[1] + color[2]*inputMix[2];
            color[0] = mono * outputMix[0];
            color[1] = mono * outputMix[1];
            color[2] = mono * outputMix[2];
            gl_FragColor = color;
        }`,
    properties:{
        "inputMix":{type:"uniform", value:[0.4,0.6,0.2]},
        "outputMix":{type:"uniform", value:[1.0,1.0,1.0]}
    },
    inputs:["u_image"]
};

const invertColEffectDescription = {
    title:"invert Colours",
    description: "Inverts colors of an image",
    vertexShader:`
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main(){
            gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0,1.0),0.0,1.0);
            v_texCoord = a_texCoord;
        }
    `,
    fragmentShader:`
        precision mediump float;
        uniform sampler2D u_image;
        varying vec2 v_texCoord;
        void main(){
            vec4 color = texture2D(u_image, v_texCoord);
            color[0] = 1.0 - color[0];
            color[1] = 1.0 - color[1];
            color[2] = 1.0 - color[2];
            gl_FragColor = color;
        }
    `,
    properties:{},
    inputs:["u_image"]
};

module.exports = {
    testEffectDescription : testEffectDescription,
    invertColEffectDescription : invertColEffectDescription
};
},{}],3:[function(require,module,exports){

// !. this needs to be modularized > 
	// module1. create canvas buffer for each stream.
	// module2. setup videocontext.

const parseVideo = (user_str,incoming_str,callback)=>{

		const user_vid = document.createElement('video');
		user_vid.srcObject = user_str;
		user_vid.play(); 
		window.user_vid = user_vid; // exposed 4 testing
		const incoming_vid = document.createElement('video');
		incoming_vid.srcObject = incoming_str;
		incoming_vid.play();
		window.incoming_vid = incoming_vid; // exposed 4 testing
		// setting up buffer canvases
		const user_cnv = document.createElement('canvas');
		const cnv_w = user_str.getVideoTracks()[0].getSettings().width;
		const cnv_h = user_str.getVideoTracks()[0].getSettings().height;
		user_cnv.width = cnv_w;
		user_cnv.height = cnv_h;
		
		const incoming_cnv = document.createElement('canvas');
		incoming_cnv.width = cnv_w;
		incoming_cnv.height = cnv_h;

		// buffering streams (stream => canvas frames)
		const render = ()=>{
			user_cnv.getContext('2d').drawImage(user_vid,0,0);
			incoming_cnv.getContext('2d').drawImage(incoming_vid,0,0);
			window.requestAnimationFrame(render);
		};
		render();
				
		const canvas = document.createElement('canvas');
		canvas.setAttribute('class', 'videocontext');
		canvas.setAttribute('id', 'final_output');
		canvas.width = cnv_w;
		canvas.height = cnv_h;

		const vc = new VideoContext(canvas); window.vc = vc; // global scope for testing		
		const user_cnv_node = vc.canvas(user_cnv);
		user_cnv_node.start(0);
		const incoming_cnv_node = vc.canvas(incoming_cnv);
		incoming_cnv_node.start(0);		

		const opacity_node = vc.effect(VideoContext.DEFINITIONS.OPACITY);		
		opacity_node.opacity = 0.5;
		incoming_cnv_node.connect(opacity_node);

		user_cnv_node.connect(vc.destination);
		opacity_node.connect(vc.destination);

		vc.play();	
		if(vc.state===0){
			callback(canvas);
		}				
};

module.exports = parseVideo;


},{}],4:[function(require,module,exports){
/*jshint esversion:6*/

// 1.observations :: 
// what works : stream -> video -> canvas -> videocontext
// seems super redundant and not the best way of approaching it
// i'd need a separate canvas for each composite stream to turn them into separate nodes 
// i might as well just overlay the canvases using CSS, but:
// what's nice about videocontext is the webgl nodes u can plug in.

// the origin + bounce streams can be composited using single canvas loop.

// what it would look like :

// o_str + b_str = comp1 => stream outgoing
//						 => videocontext; 
//						    videocontext <= canvas <= video <= incoming stream;

// hmm, might be quite a bottle neck
// especially since all the canvas (except of videocontext) have '2d' context;

// 2. i still need to get the transparency formula for blending equally. 

// 3. this need to modularized > 
	// module1. create canvas buffer for each stream.
	// module2. setup videocontext.

const parseVideo = (origin_str,bounced_str,callback)=>{

		// importing videcontext js, served via express (routes.js).
		const imported = document.createElement('script');
		imported.src = '/scripts/videocontext.js';
		document.head.appendChild(imported);

		const origin_vid = document.createElement('video');
		origin_vid.srcObject = origin_str;
		origin_vid.play(); 
		window.origin_vid = origin_vid; // exposed 4 testing
		const bounced_vid = document.createElement('video');
		bounced_vid.srcObject = bounced_str;
		bounced_vid.play();
		window.bounced_vid = bounced_vid; // exposed 4 testing
		// setting up buffer canvases
		const origin_cnv = document.createElement('canvas');
		const cnv_w = origin_str.getVideoTracks()[0].getSettings().width;
		const cnv_h = origin_str.getVideoTracks()[0].getSettings().height;
		origin_cnv.width = cnv_w;
		origin_cnv.height = cnv_h;
		
		const bounced_cnv = document.createElement('canvas');
		bounced_cnv.width = cnv_w;
		bounced_cnv.height = cnv_h;

		// buffering streams (stream => canvas frames)
		const render = ()=>{
			origin_cnv.getContext('2d').drawImage(origin_vid,0,0);
			bounced_cnv.getContext('2d').drawImage(bounced_vid,0,0);
			window.requestAnimationFrame(render);
		};
		render();

		
		imported.addEventListener('load',()=>{
			const canvas = document.createElement('canvas');
			canvas.setAttribute('class', 'videocontext');
			canvas.width = cnv_w;
			canvas.height = cnv_h;

			const vc = new VideoContext(canvas); window.vc = vc; // global scope for testing		
			const origin_cnv_node = vc.canvas(origin_cnv);
			origin_cnv_node.start(0);
			const bounced_cnv_node = vc.canvas(bounced_cnv);
			bounced_cnv_node.start(0);		
			const invertColEffectDescription = require('./shader_descriptions.js').invertColEffectDescription;
			const invertColors_node = vc.effect(invertColEffectDescription);
			bounced_cnv_node.connect(invertColors_node);
			const opacity_node = vc.effect(VideoContext.DEFINITIONS.OPACITY);		
			opacity_node.opacity = 0.5;
			invertColors_node.connect(opacity_node);

			origin_cnv_node.connect(vc.destination);
			opacity_node.connect(vc.destination);

			//now i need to pass bounced to fiter node.
			//i.e. i need to write a vertex && fragment shader 4 the effect node

			vc.play();	
			if(vc.state===0){
				callback(canvas);
			}				
		});
};

module.exports = parseVideo;


},{"./shader_descriptions.js":2}]},{},[1]);
