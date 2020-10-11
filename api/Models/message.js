'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MessageSchema = Schema({
        text: String,
        created_at: String,
        emitter: {type: Schema.ObjectID, ref: 'User'},
        receiver: {type: Schema.ObjectID, ref: 'User'}
});

module.exports = mongoose.model('Message', MessageSchema);