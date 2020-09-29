/*jshint esversion:6*/
const socket = io();
socket.on('connect',()=>{
	console.log('connected socket !!!');
});

const roomForm = require('./roomForm.js');
const calls = require('./calls.js');

roomForm(socket);

