'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Chart = new Schema({
    name:String,
	data:Object,
   updated:Date
});

module.exports = mongoose.model('Chart',Chart);
