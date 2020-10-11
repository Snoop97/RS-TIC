'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// cargar rutas





//crear middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// crud



// rutas
app.get('/', (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde el servidor de NodeJS.'
    })
});

app.get('/prueba', (req, res) => {
    res.status(200).send({
        message: 'Prueba de conexión con el servidor.'
    })
});



//exportar configuración
module.exports = app;