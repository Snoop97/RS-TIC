'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../Models/publication');
var User = require('../Models/user');
var Follow = require('../Models/follow');

function probando(req, res){
    res.status(200).send({
        message: 'Hola desde el controlador de Publicación.'
    });
}

function savePublication(req, res){
    var params = req.body;

    if(!params.text){
        return res.status(200).send({
            message: 'Debes enviar un texto.'
        });
    }

    var publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.create_at = moment().unix();

    publication.save((err, publicationStored) => {
        if(err){
            return res.status(500).send({
                message: 'Error al guardar la publicación.'
            });
        }
        if(!publicationStored){
            return res.status(404).send({
                message: 'La publicación no ha sido guardada.'
            });
        }
        return res.status(200).send({
            publication: publicationStored
        });
    });
}

function getPublications(req, res){
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 4;

    Follow.find({
       user: req.user.sub
    }).populate('followed').exec((err, follows) => {
        if(err){
            return res.status(500).send({
                message: 'Error al devolver el seguimiento.'
            });
        }
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        follows_clean.push(req.user.sub);

        Publication.find({
            user: {
                "$in": follows_clean
            }
        }).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if(err){
                return res.status(500).send({
                    message: 'Error al devolver publicaciones.'
                });
            }
            if(!publications){
                return res.status(404).send({
                    message: 'No hay publicaciones.'
                });
            }
            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total/itemsPerPage),
                page: page,
                itemsPerPage: itemsPerPage,
                publications
            });
        });

    });
}

function getPublication(req, res){
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if(err){
            return res.status(500).send({
                message: 'Error al devolver el seguimiento.'
            });
        }
        if(!publication){
            return res.status(404).send({
                message: 'No existe la publicación.'
            });
        }
        return res.status(200).send({ publication });
    });
}

function deletePublication(req, res){
    var publicationId = req.params.id;

    Publication.find({
        'user': req.user.sub,
        '_id': publicationId
    }).remove((err, publicationRemoved) => {
        if(err){
            return res.status(500).send({
                message: 'Error al borrar publicaciones.'
            });
        }
        if(!publicationRemoved){
            return res.status(404).send({
                message: 'No se ha borrado la publicación.'
            });
        }
        return res.status(200).send({
            message: 'Publicación eliminada.'
        });
    });
}

//SUBIR ARCHIVOS DE IMAGEN - AVATAR DE USUARIO
function uploadImage(req, res){
    var publicationId = req.params.id;

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

        if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
            Publication.find({
                'user': req.user.sub,
                '_id': publicationId
            }).exec((err, publication) => {
                console.log(publication);
                if(publication){
                    //actualizar documento de la publicación
                    Publication.findByIdAndUpdate(publicationId, {file: fileName}, {new: true}, (err, publicationUpdate) => {
                        if(err){
                            return res.status(500).send({
                                message: 'No tiene permiso para actualizar los datos del usuario.'
                            });
                        }
                        if(!publicationUpdate){
                            return res.status(400).send({
                                message: 'No se ha podido actualizar los datos del usuario.'
                            });
                        }
                        return res.status(200).send({
                            publication: publicationUpdate
                        });
                    });
                }else{
                    return removeFilesOfUploads(res, filePath, 'No tienes permiso para actualizar la publicación.');
                }
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
    var pathFile = './uploads/publications/'+image_File;

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
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}