const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const httpolyglot = require('httpolyglot')


const app = express();

const privateKey = fs.readFileSync('/etc/letsencrypt/live/justfornow.ml/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/justfornow.ml/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/justfornow.ml/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// const port = process.env.PORT || 8080;

require('./routes')(app);

// const httpsServer = httpolyglot.createServer(credentials,app);
// httpsServer.listen(8080, ()=>{
// 	console.log('listening on port 8080');
// });

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});