const fs = require('fs');
const express = require('express');
const httpolyglot = require('httpolyglot');
let io = require('socket.io');

// localtesting  
// const http = require('http');
// ~~~~~~~~~~~~~~~~~~

const app = express();

// 4 remote server
const privateKey = fs.readFileSync('/etc/letsencrypt/live/justfornow.ml/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/justfornow.ml/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/justfornow.ml/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
// ~~~~~~~~~~~~~~~~~~

const port = process.env.PORT || 8080;

require('./routes')(app);
 
 // 4 remote server
const httpsServer = httpolyglot.createServer(credentials,app);
httpsServer.listen(port, ()=>{
	console.log('listening on port 8080');
});
// ~~~~~~~~~~~~~~~~~~

// localtesting  
// const httpServer = http.createServer(app);
// httpServer.listen(port, ()=>{
// 	console.log('dev : listening on port 8080');
// });
// ~~~~~~~~~~~~~~~~~~

// io ~~~~~ passing peerID around (its just gonan be faster)
io = io(httpServer);
io.on('connection', socket => {
	console.log("socket connected:");

	socket.on('userConn',(data)=>{
		console.log('incoming');
		socket.broadcast.emit('userConn',data);
	});
});

