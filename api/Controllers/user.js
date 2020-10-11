'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../Models/user');

function home(req, res){
    res.status(200).send({
        message: 'Hola mundo desde el servidor de NodeJS.'
    });
}

function pruebas(req, res){
    console.log(req.body);
    res.status(200).send({
        message: 'Prueba de conexión con el servidor.'
    });
}

function saveUser(req, res){
    var params = req.body;
    var user = new User();

    if(params.name && params.surname && params.nick && params.email && params.password){

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.password = params.password;
        user.role = 'ROLE_USER';
        user.image = null;

        //guardando la contraseña cifrada
        bcrypt.hash(params.password, null, null, (err, hash) => {
           user.password = hash;

           user.save((err, userStored) => {
                if(err) {
                    return res.status(500).send({
                        message: 'Error al guardar usuario.'
                    });
                }
                if(userStored){
                    res.status(200).send({
                        user: userStored
                    });
                }else{
                    res.status(404).send({
                       message: 'No se ha registrado el usuario.'
                    });
                }

           });
        });

    }else{
        res.status(200).send({
            message: 'Envía todos los campos necesarios.'
        });
    }

}

module.exports = {
    home,
    pruebas,
    saveUser
}
