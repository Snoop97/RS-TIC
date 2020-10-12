'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../Models/user');
var jwt = require('../Services/jwt');
//METODOS DE PRUEBA

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

//REGISTRO DE USUARIO
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

        //validar usuarios duplicados
        User.find({ $or: [
                             {email: user.email.toLowerCase()},
                             {nick: user.nick.toLowerCase()}
                ]}).exec((err, users) => {
            if(err) {
                return res.status(500).send({
                    message: 'Error en la petición de usuarios.'
                });
            }else if(users && users.length >= 1) {
                return res.status(200).send({
                    message: 'El usuario que intenta registrar ya existe.'
                });
            }else{
                //cifra la contraseña y guarda los datos
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
            }
        });

    }else{
        res.status(200).send({
            message: 'Envía todos los campos necesarios.'
        });
    }
}

//LOGIN DE USUARIO
function loginUser(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, user) => {
            if(err) {
                return res.status(500).send({
                    message: 'Error en la petición.'
                });
            }
            if(user){
                bcrypt.compare(password, user.password, (err, check) => {
                   if(check){
                       //devolver datos de usuario
                       if(params.gettoken){
                            //generar y devolver el token
                            return res.status(200).send({
                                token: jwt.createToken(user)
                            });
                       }else{
                           // que no devuelve el password
                           user.password = undefined;
                           return res.status(200).send({user});
                       }
                   }else{
                       return res.status(404).send({
                           message: 'El usuario no se ha podido identificar.'
                       });
                   }
                });
            }else{
                return res.status(404).send({
                    message: 'El usuario no se ha podido identificar.'
                });
            }
    });
}

// METODO PARA CONSEGUIR DATOS DE UN USUARIO
function getUser(req, res){
    var userID = req.params.id;
    User.findById(userID, (err, user) => {
        if(err){
            return res.status(500).send({
                message: 'Error en la petición.'
            });
        }
        if(!user){
            return res.status(404).send({
                message: 'El usuario no existe.'
            });
        }
        return res.status(200).send({user});
    });

}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser
}
