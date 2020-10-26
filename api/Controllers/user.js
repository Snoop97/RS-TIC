'use strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var User = require('../Models/user');
var Follow = require('../Models/follow');
var jwt = require('../Services/jwt');
var fs = require('fs');
var path = require('path');

//METODOS DE PRUEBA
function home(req, res){
    res.status(200).send({
        message: 'Hola mundo desde el servidor de NodeJS.'
    });
}

// método de prueba
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
                           // que no devuelva el password
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
        followThisUser(req.user.sub, userID).then((value) => {
            user.password = undefined;
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });
    });
}


/* FUNCIÓN ASÍNCRONA CON LLAMADAS ASÍNCRONAS DENTRO, CUANDO SE EJECUTA ALGO SE ESPERA A QUE SE CONSIGA
   EL RESULTADO Y DESPUÉS PASA A LA SIGUIENTE */
/* AWAIT ES PARA QUE ESPERE A QUE EL FIND NOS DEVUELVA EL RESULTADO Y LO GUARDA EN CADA VARIABLE, COMO
SI FUERA ASÍNCRONO*/
async function followThisUser(identity_user_id, user_id){

    var following = await Follow.findOne({
        "user": identity_user_id,
        "followed": user_id
    }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.findOne({
        "user": user_id,
        "followed": identity_user_id
    }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });
    return {
        following: following,
        followed: followed
    }
}

//DEVOLVER UN LISTADO DE USUARIO
function getUsers(req, res){
    var identity_user_id = req.user.sub;
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if(err){
            return res.status(500).send({
                message: 'Error en la petición.',
                err
            });
        }
        if(!users){
            return res.status(404).send({
                message: 'No hay usuarios disponibles'
            });
        }

        followUserId(identity_user_id).then((response) => {

            return res.status(200).send({
                message: "Resultados:",
                users,
                users_following: response.following,
                users_followed: response.followed,
                total,
                pages: Math.ceil(total/itemsPerPage)
            });
        });
    });
}

async function followUserId(user_id){
    var following = await Follow.find({
        "user": user_id
    }).select({
        '_id': 0,
        '__v': 0,
        'user': 0
    }).exec().then((follows) => {
        return follows;
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.find({
        "followed": user_id
    }).select({
        '_id': 0,
        '__v': 0,
        'followed': 0
    }).exec().then((follows) => {
        return follows;
    }).catch((err) => {
        return handleError(err);
    });

    var following_clean = [];

    followed.forEach((follow) => {
        following_clean.push(follow.user);
    });

    var followed_clean = [];

    followed.forEach((follow) => {
        followed_clean.push(follow.user);
    });

    return {
        following: following_clean,
        followed: followed_clean
    }

}

function getCounters(req, res){
    let userID = req.user.sub;
    if(req.params.id){
        userID = req.params.id;
    }else{
        getCountFollow(userID).then((value) => {
            return res.status(200).send(value);
        });
    }
}

async function getCountFollow(user_id){
    try {
        let following = await Follow.countDocuments(
            { "user": user_id },
            (err,result) => {
                return result
            }
        );
        let followed = await Follow.countDocuments(
            { "followed": user_id }
        ).then(count => count);
        return {
            following,
            followed
        }
    }catch (e) {
        console.log(e);
    }
}

//EDICIÓN DE DATOS DE USUARIO
function updateUser(req, res){
    var userID = req.params.id;
    var update = req.body;

    //borrando la propiedad password
    delete update.password;
    if(userID != req.user.sub){
        return res.status(500).send({
           message: 'No tiene permiso para actualizar los datos del usuario.'
        });
    }

    User.findByIdAndUpdate(userID, update, {new: true}, (err, userUpdate) => {
        if(userID != req.user.sub){
            return res.status(500).send({
                message: 'No tiene permiso para actualizar los datos del usuario.'
            });
        }
        if(!userUpdate){
            return res.status(400).send({
                message: 'No se ha podido actualizar los datos del usuario.'
            });
        }
        return res.status(200).send({
           user: userUpdate
        });
    });

}

//SUBIR ARCHIVOS DE IMAGEN - AVATAR DE USUARIO
function uploadImage(req, res){
    var userID = req.params.id;

    if(req.files){
        var filePath = req.files.image.path;
        console.log(filePath);

        var fileSplit = filePath.split('\\');
        console.log(fileSplit);

        var fileName = fileSplit[2];
        console.log(fileName);

        var extSplit = fileName.split('\.');
        console.log(extSplit);

        var fileExt = extSplit[1];
        console.log(fileExt);

        if(userID != req.user.sub){
            return removeFilesOfUploads(res, filePath, 'No tiene permiso para actualizar los datos del usuario.');
        }
        if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
            //actualizar documento del usuario logeado
            User.findByIdAndUpdate(userID, {image: fileName}, {new: true}, (err, userUpdate) => {
                if(userID != req.user.sub){
                    return res.status(500).send({
                        message: 'No tiene permiso para actualizar los datos del usuario.'
                    });
                }
                if(!userUpdate){
                    return res.status(400).send({
                        message: 'No se ha podido actualizar los datos del usuario.'
                    });
                }
                return res.status(200).send({
                    user: userUpdate
                });
            });

        }else{
            return removeFilesOfUploads(res, filePath, 'Extensión no válida.');
        }
    }else{
        return res.status(200).send({
            message: 'No se han subido archivos.'
        });
    }
}

function removeFilesOfUploads(res, filePath, message){
    fs.unlink(filePath, (err) => {
        if(err){
            return res.status(200).send({
                message: message
            });
        }
    });
}

function getImageFile(req, res){
    var image_File = req.params.imageFile;
    var pathFile = './uploads/users/'+image_File;

    fs.exists(pathFile, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(pathFile));
        } else {
            res.status(200).send({
                message: 'No existe la imagen.'
            });
        }
    });
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile,
}

