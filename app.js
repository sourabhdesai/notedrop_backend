/**
 * Module dependencies.
 */

var express = require('express');
var http    = require('http');
var path    = require('path');
var db      = require('./database');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req,res) {
	res.json({
		message : "Fuck Yeah!! The Server is up :)"
	});
});

// User Data EndPoints
app.post('/user/create' , db.Users.createUser);
app.get('/user/get/:id' , db.Users.readUser);
app.put('/user/login'   , db.Users.loginUser);
app.put('/user/update'  , db.Users.updateUser);
app.put('/user/finduser', db.Users.findUser);
app.put('/user/getusers', db.Users.getUsers);
app.put('/user/delete'  , db.Users.deleteUser);

// Note Data EndPoints
app.post('/note/create', db.Notes.createNote);
app.get('/note/get/:id', db.Notes.readNote);
app.put('/note/update' , db.Notes.updateNote);
app.put('/note/update' , db.Notes.deleteNote);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
