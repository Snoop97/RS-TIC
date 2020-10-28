'use strict'

var express = require('express');
var messageController = require('../Controllers/message');
var api = express.Router();
var md_Auth = require('../Middlewares/authenticated');

api.get('/probando-md', md_Auth.ensureAuth, messageController.prueba);
api.post('/message', md_Auth.ensureAuth, messageController.saveMessage);
api.get('/my-messages/:page?', md_Auth.ensureAuth, messageController.getReceivedMessages);
api.get('/messages/:page?', md_Auth.ensureAuth, messageController.getEmitMessages);
api.get('/unviewed-messages', md_Auth.ensureAuth, messageController.getUnviewedMessages);
api.get('/set-viewed-messages', md_Auth.ensureAuth, messageController.setViewedMessages);

module.exports = api;