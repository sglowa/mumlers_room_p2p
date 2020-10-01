/*jshint esversion:6*/
const httpGet =(theUrl)=>{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request, important for data flow
    xmlHttp.setRequestHeader("Content-type", "text/html");
    /* const data = {data:'something'};
    xmlHttp.send(JSON.stringify(data)); // in case i need to send smthng with POST*/
    xmlHttp.send();
	return xmlHttp.responseText;  
};

const httpPost =(theUrl,data)=>{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", theUrl, false ); // false for synchronous request, important for data flow
    xmlHttp.setRequestHeader("Content-type", 'application/json');
    const dataObject = {data:data}; //shorthand
    xmlHttp.send(JSON.stringify(dataObject)); // in case i need to send smthng with POST
	return xmlHttp.response;  
};

const validator = require('validator');
// regex to match only 1 || 0 spaces between words, no trailing spaces :
// ^\S+(\s\S+)*$
const validateInput = (input)=>{
	const isEmpty = validator.isEmpty(validator.trim(input),{ignore_whitespace:true}) ?
		'room name is required' : false;
	const isLength = !validator.isLength(validator.trim(input),{min:6,max:24}) ?
		'room name must be between 6 and 24 characters' : false;
	const isTrailingSpace = validator.trim(input) != input ?
		'room name cannot contain whitespace at the start or end' : false;
	if(isEmpty || isLength || isTrailingSpace){
		if(isEmpty)console.error(isEmpty); //also log on screen 
		if(isLength)console.error(isLength); //also log on screen 
		if(isTrailingSpace && !isLength)console.error(isTrailingSpace); //also log on screen 
		return false;
	}else{
		return input;
	}
};

const sanitizeInput = (input)=>{
	console.log(validator.escape(input));
	const isSanitized = input === validator.escape(input) ?
		input : 
		(()=>{
			console.error("looks like you're using invalid characters");			
			return false;
		})()
	return isSanitized;
};

const getUserMedia = ()=>{
	return new Promise((resolve,reject)=>{

		navigator.getUserMedia = ( navigator.getUserMedia ||
		                       navigator.webkitGetUserMedia ||
		                       navigator.mozGetUserMedia ||
		                       navigator.msGetUserMedia);

		navigator.getUserMedia({video:{
			width:{ideal:480},
			height:{ideal:360}
		},audio:false},myStream=>{
			resolve(myStream);
		},err=>{
			reject(new Error(err));
		});
	});
};

const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

const createEmptyVideoTrack = ({ width, height }) => {
  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  canvas.getContext('2d').fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: false });
};

const makeEmptyStream = ({ width, height })=>{
	const newAudioT = createEmptyAudioTrack();
	const newVideoT = createEmptyVideoTrack({width:height});
	return new MediaStream([newAudioT,newVideoT])	
}

const changeTracks=(peerConnection,track)=>{
	
	const senders = peerConnection.getSenders();
	const sender = senders.find(s=>{
		return s.track.kind == track.kind;
	});
	if(sender==undefined){
		console.error(`${track.kind} track you want to replace does not exist`);
		return;
	} 
	sender.replaceTrack(track);
}


// using es6 shorthand
module.exports = {
	httpGet,
	httpPost,
	validateInput,
	sanitizeInput,
	getUserMedia,
	makeEmptyStream,
	changeTracks
};