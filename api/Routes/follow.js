'use strict'

var express = require('express');
var followController = require('../Controllers/follow');
var api = express.Router();
var md_auth = require('../Middlewares/authenticated');

api.post('/follow', md_auth.ensureAuth, followController.saveFollow);

module.exports = api;
