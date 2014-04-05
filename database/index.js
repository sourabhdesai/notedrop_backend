var mongoose = require('mongoose');

var MongoHostURL = "PUT URL HERE"; // Change this

var db = mongoose.createConnection(MongoHostURL);

db.once('open', function () {
	var UserModule = require('./users');
	var Users      = new UserModule(mongoose, db);

	var NotesModule = require('./notes');
	var Notes       = new NotesModule(mongoose, db);

	Users.NotesModel = Notes.model;
	Notes.UserModel  = Users.model;

	exports.Users = Users;
	exports.Notes = Notes;
});