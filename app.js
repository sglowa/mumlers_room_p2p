const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const httpolyglot = require('httpolyglot')


const app = express();

const privateKey = fs.readFileSync('/etc/letsencrypt/live/justfornow.ml/privkey.pem', 'utf8');
const certificate = readFileSync('/etc/letsencrypt/live/justfornow.ml/privkey.pem', 'utf8');
const ca = readFileSync('/etc/letsencrypt/live/justfornow.ml/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const port = process.env.PORT || 8080;

require('./routes')(app);

const httpsServer = httpolyglot.createServer(credentials,app);
httpsServer.listen(8080, ()=>{
	console.log('listening on port 8080');
});