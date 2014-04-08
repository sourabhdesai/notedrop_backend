
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var db = require('./database');

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
app.post('/createuser', db.Users.createUser);
app.get('/getuser/:id', db.Users.readUser  );
app.put('/addnote' , db.Users.updateUser);
app.delete('/deleteuser' , db.Users.deleteUser);

// Note Data EndPoints
app.post('/createnote', db.Notes.createNote);
app.get('/getnote/:id', db.Notes.readNote  );
app.put('/updatenote' , db.Notes.updateNote);
app.delete('/deletenote' , db.Notes.deleteNote);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
