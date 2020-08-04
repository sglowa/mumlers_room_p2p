const path = require('path');
const express = require('express');

module.exports = (app) => {
	// public is enough, since everything else is bundled by browserify 
	app.use(express.static(path.join(__dirname,'public')));
} 