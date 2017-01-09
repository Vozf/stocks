'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');







var app = express();






require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

var port = process.env.PORT || 8080;
var serv =app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});

var io = require('socket.io').listen(serv);
var request = require("request");

var names=['AAPL', 'GOOG', "AET", "MSFT"];

io.on('connection', function(socket){

  socket.on('add', function(msg){
      
      	request({
		uri: 'https://stocks-vozf.c9users.io/api/' + msg ,
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 10
	}, function(error, response, body){
	    body = JSON.parse(body);
	    if(body.error==="Wrong code")
	        socket.emit("err","Wrong code");
	    else{
	        names.push(msg.toUpperCase());
            io.emit('arr',names);
	    }
	    
	});



  });
socket.on('del', function(msg){
    console.log("deleting "+msg+names.indexOf(msg.toUpperCase()));
    
    if(names.indexOf(msg.toUpperCase())!==-1){
        names.splice(names.indexOf(msg.toUpperCase()),1);
        io.emit('arr',names);
    }
    else{
        socket.emit("err","Wrong code");
    }
  });
      socket.emit("arr",names);
});
