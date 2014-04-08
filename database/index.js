var mongoose = require('mongoose');
var Users    = require('./users');
var Notes    = require('./notes');

// Attatch Mongoose to Each to get Access to mongoose api
Users.attatchMongoose(mongoose);
Notes.attatchMongoose(mongoose);

exports.Users = Users;
exports.Notes = Notes;

var db = mongoose.createConnection("mongodb://sourabhd:hovyhov1@ds037097.mongolab.com:37097/dropnote_db");

db.once('open', function () {
	// Create Models to Use Internally
	Users.createModel(db);
	Notes.createModel(db);
	// Share Models Between Users and Notes so they can do Operations on Each Other
	Users.NotesModel = Notes.model;
	Notes.UserModel  = Users.model;

});