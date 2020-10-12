'use strict'

var express = require('express');
var UserController = require('../Controllers/user');
var md_auth = require('../Middlewares/authenticated');

var api = express.Router();

api.get('/home', UserController.home);
api.get('/pruebas', md_auth.ensureAuth, UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);

module.exports = api;

