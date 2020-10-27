'use strict'

var express = require('express');
var publicationController = require('../Controllers/publication');
var api = express.Router();
var md_Auth = require('../Middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/publications'});

api.get('/probando-pub', md_Auth.ensureAuth, publicationController.probando);
api.post('/publication', md_Auth.ensureAuth, publicationController.savePublication);
api.get('/publications/:page?', md_Auth.ensureAuth, publicationController.getPublications);
api.get('/publication/:id', md_Auth.ensureAuth, publicationController.getPublication);
api.delete('/publication/:id', md_Auth.ensureAuth, publicationController.deletePublication);
api.post('/upload-image-pub/:id', [md_Auth.ensureAuth, md_upload], publicationController.uploadImage);
api.get('/get-image-pub/:imageFile', publicationController.getImageFile);

module.exports = api;