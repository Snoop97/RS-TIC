'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// cargar rutas
var user_routes = require('./Routes/user');
var follow_routes = require('./Routes/follow');

//crear middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// CORS


// rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);

//exportar configuración
module.exports = app;