'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//conexión a la BD MongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/RS_TIC_db', {useNewUrlParser: true,
    useUnifiedTopology: true})
    .then(() => {
        console.log("La conexion a la BD de la red social es correcta.");

        //crear servidor
        app.listen(port, () => {
            console.log("Servidor corriendo en http://localhost:3800");
        });

    })
    .catch(err => console.log(err));






