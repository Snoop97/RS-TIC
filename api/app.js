'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// cargar rutas
var user_routes = require('./Routes/user');

//crear middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// crud


// rutas
app.use('/api', user_routes);


//exportar configuración
module.exports = app;