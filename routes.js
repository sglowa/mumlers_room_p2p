const path = require('path');
const express = require('express');

module.exports = (app) => {
	// public is enough, since everything else is bundled by browserify 
	app.use(express.static(path.join(__dirname,'public')));
	app.use('/scripts',express.static(path.join(__dirname,'node_modules/videocontext/dist/')));
} 