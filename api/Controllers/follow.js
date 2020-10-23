'use strict'

// var path = require('path');
// var fs = require('fs');

var mongoosePaginate = require('mongoose-pagination');

var User = require('../Models/user');
var Follow = require('../Models/follow');

function saveFollow(req, res){
    var params = req.body;

    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if(err){
            return res.status(500).send({
                message: 'Error al guardar seguimiento.'
            });
        }
        if(!followStored){
            return res.status(404).send({
                message: 'El seguimiento no se ha guardado.'
            });
        }
        return res.status(200).send({
            follow: followStored
        });
    });

}

module.exports = {
    saveFollow
}