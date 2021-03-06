var mongoose      = null;
var Note          = null;
exports.UserModel = null;
exports.model     = null;
var async         = require('async');

exports.attatchMongoose = function(m) {
	mongoose = m;
};

exports.createModel = function(db) {
 
	var NoteSchema = new mongoose.Schema(
		{
			text      : String,
			latlong   : [Number], // [ Latitude , Longitude ]
			radius    : Number,
			startDate : Number,
			endDate   : Number,
			users     : [mongoose.Schema.Types.ObjectId]
		}
	);

	NoteSchema.methods.removeUser = function(id) {
		for(var i = 0; i < this.users.length; i++) {
			if( this.users[i].equals(id) ) {
				this.users.splice(i,1);
				return;
			}
		}
	};

	Note = db.model("Note", NoteSchema);

	exports.model = Note;	
};

// CRUD Operations on Note Schema
// Create a new Note
exports.createNote = function(req,res) {
	var text      = req.body.text;
	var latitude  = parseFloat(req.body.latitude);
	var longitude = parseFloat(req.body.longitude);
	var radius    = parseFloat(req.body.radius);
	var startDate = parseFloat(req.body.startDate);
	var endDate   = parseFloat(req.body.endDate);
	var userIDs   = req.body.users.split(','); //O(n) operation ... Can't pass an array through post body
	for(var i = 0; i < userIDs.length; i++) {
		userIDs[i] = mongoose.Types.ObjectId( userIDs[i] );
	}

	var newNote       = new Note();
	newNote.text      = text;
	newNote.latlong   = [latitude,longitude];
	newNote.radius    = radius;
	newNote.startDate = startDate;
	newNote.endDate   = endDate
	newNote.users     = userIDs;

	newNote.save(function (err) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at createNote 1");
			console.log(err);
		} else {
			exports.UserModel.update( { _id : { $in : userIDs } }, { $push : { notes : newNote._id } } ).exec(function(err) {
				if (err) {
					res.json({
						success : false,
						message : err
					});
				} else {
					res.json({
						success : true,
						message : {
							ID : newNote._id
						}
					});
				}
			});
		}
	});
}; // createNote END

// Read an existing Note's data
exports.readNote = function(req,res) {
	var noteID = req.param("id");
	Note.findById(mongoose.Types.ObjectId(noteID)).exec(function(err,note) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at readNote 1");
			console.log(err);
		} else if(note) {
			res.json({
				success : true,
				message : note
			});
		} else {
			res.json({
				success : false,
				message : "Incorrect Note ID"
			});
		}
	});
}; // readNote END

// Update data on Note ... Can Update any field within Note document
exports.updateNote = function(req,res) {
	var noteID = req.body.noteID;
	var updates = {};
	if ( req.body.text || req.body.latlong || req.body.radius|| req.body.startDate || req.body.endDate ) {
		updates["$set"] = {};
	}
	if (req.body.text) {
		updates.$set.text = req.body.text;
	}
	if (req.body.latlong) {
		var latlong = req.body.latlong.split(',');
		updates.$set.latlong = [ parseFloat(latlong[0]) , parseFloat(latlong[1]) ];
	}
	if (req.body.radius) {
		updates.$set.radius = parseFloat(req.body.radius);
	}
	if (req.body.startDate) {
		updates.$set.startDate = parseFloat(req.body.startDate);
	}
	if (req.body.endDate) {
		updates.$set.endDate = parseFloat(req.body.endDate);
	}
	if (req.body.newusers) {
		var newusersArray = req.body.newusers.split(',');
		for(var i = 0; i < newusersArray.length; i++) {
			newusersArray[i] = mongoose.Types.ObjectId(newusersArray[i]);
		}
		updates.$pushAll = { users : newusersArray };
	}
	if (req.body.removeusers) {
		var removeusersArray = req.body.split(',');
		for(var i = 0; i < removeusersArray.length; i++) {
			removeusersArray[i] = mongoose.Types.ObjectId(removeusersArray[i]);
		}
		updates.$pullAll = { users : removeusersArray };
	}
	Note.update( { _id : noteID }, updates ).exec(function(err) {
		if (err) {
			res.json({
				success : true,
				message : err
			});
			console.log("Error Here at updateNote 1");
			console.log(err);
		} else {
			Note.findById( mongoose.Types.ObjectId(noteID) ).exec(function(err, note) {
				if (err) {
					res.json({
						success : false,
						message : err
					});
					console.log("Error Here at updateNote 2");
					console.log(err);
				} else if (note){
					var pushUsers = null, pullUsers = null;
					var funcArray = [];
					if (req.body.newusers) {
						pushUsers = User.update( { _id : { $in : updates.$pushAll.users } }, { $push : { notes : note._id } }).exec;
						funcArray.push(pushUsers);
					}
					if (req.body.removeusers) {
						pullUsers = User.update( { _id : { $in : updates.$pullAll.users } }, { $pull : { notes : note._id } }).exec;
						funcArray.push(pullUsers);
					}
					if (funcArray.length == 0) {
						res.json({
							success : true,
							message : "Succesfully Updated Note"
						});
					} else {
						async.series(funcArray, function(err) {
							if (err) {
								res.json({
									success : false,
									message : err
								});
								console.log("Error Here at updateNote 3");
								console.log(err);
							} else {
								res.json({
									success : true,
									message : "Succesfully Updated Note"
								});
							}
						});
					}
				} else {
					res.json({
						success : false,
						message : "Couldn't Find Note with the Given Note ID"
					});
				}
			});
		}
	});

	/*
	Note.findById(mongoose.Types.ObjectId(noteID)).exec(function(err,note) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at updateNote 1");
			console.log(err);
		} else {
			// Set each field if an new one is given
			if (req.body.text)
				note.text = req.body.text;
			if (req.body.latitude) {
				note.latlong[0] = parseFloat(req.body.latitude);
				note.latlong[1] = parseFloat(req.body.longitude);
			}
			if (req.body.radius)
				note.radius = parseFloat(req.body.radius);
			if (req.body.startDate)
				note.startDate = parseFloat(req.body.startDate);
			if (req.body.endDate)
				note.endDate = parseFloat(req.body.endDate);
			if(req.body.newusers && req.body.removeusers) {
				var newusers     = req.body.newusers.split(',');
				var removeusers  = req.body.removeusers.split(',');
				var newNoteUsers = new Array( note.users.length - removeusers.length + newusers.length );
				// Add All Objects in note.users that aren't in removeusers to newNoteUsers
				for(var i1 = 0, i2 = 0; i1 < note.users.length - newNoteUsers.length; ) {
					var usersString = note.users[i2].toString();
					for(var a = 0; a < removeusers.length; i++) {
						if ( removeusers[a] && removeusers[a] == usersString ) {
							removeusers[a] = null;
							note.users[i2] = null;
							break;
						}
					}
					if (note.users[i2]) {
						// Wasn't removed ... add it to the new array
						newNoteUsers[i1] = note.users[i2];
						i1++;
						i2++;
					} else {
						i2++;
					}

				}
				// Add All Objects in newusers to remaining indexes of newNoteUsers
				for(var i = note.users.length - removeusers.length, a = 0; i < newNoteUsers; i++) {
					newNoteUsers[i] = mongoose.Types.ObjectId(newusers[a]);
					a++;
				}
				note.users = newNoteUsers;
			} else if (req.body.newusers) {
				var newusers = req.body.newusers.split(",");
				var newNoteUsers = new Array(note.users.length + newusers.length);
				for(var i = 0; i < note.users.length; i++) {
					newNoteUsers[i] = mongoose.Types.ObjectId(note.users[i]);
				}
				for(var i = note.users.length; i < newNoteUsers.length;i++) {
					newNoteUsers[i] = mongoose.Types.ObjectId(newusers[i - note.users.length]);
				}
				note.users = newNoteUsers;
				// Go to Each User and Add the new Note to it
			} else if(req.body.removeusers) {
				var removeusers = req.body.removeusers.split(',');
				var newNoteUsers = new Array(note.users.length - removeusers.length);
				for(var i = 0, n = 0; i < newNoteUsers.length;) {
					var idString = note.users[n].toString();
					for(var a = 0; a < removeusers.length; a++) {
						if (removeusers[a] && removeusers[a] == idString) {
							removeusers[a] = null;
							note.users[n]  = null;
							break;
						}
					}
					if(note.users[n]) {
						// It wasn't removed ... add it to newNoteUsers
						newNoteUsers[i] = note.users[n];
						n++;
						i++;
					} else {
						n++;
					}
				}
				note.users = newNoteUsers;
			}
			if(req.body.newusers) {
				// update users in newusers, then, if it exists, in removeusers 
				var newusers = req.body.newusers.split(",");
				for(var i = 0; i < newusers.length; i++) {
					newusers[i] = { _id : newusers[i] };
				}
				exports.UserModel.find().or(newusers).exec(function (err, users) {
					if (err) {
						res.json({
							success : false,
							message : err
						});
					console.log("Error Here at updateNote 2");
					console.log(err);
					} else {
						for(var i = 0; i < users.length; i++) {
							user[i].notes.push(note._id);
							var err = user[i].save();
							if (err) {
								res.json({
									success : false,
									message : err
								});
								console.log("Error Here at updateNote 3 at index " + i);
								console.log(err);
								return;
							}
						}
						if (req.body.removeusers) {
							var removeusers = req.body.removeusers.split(",");
							for(var i = 0; i < removeusers.length; i++) {
								removeusers[i] = mongoose.Types.ObjectId(removeusers[i]);
							}
							exports.UserModel.find().or(removeusers).exec( function(err,rUsers) {
								if (err) {
									res.json({
										success : false,
										message : err
									});
									console.log("Error Here at updateNote 4");
									console.log(err);
								} else {
									for (var i = rUsers.length - 1; i >= 0; i--) {
										rUsers[i].removeNote(note._id);
										var err = rUsers[i].save();
										if(err) {
											res.json({
												success : false,
												message : err
											});
											console.log("Error Here at updateNote 5 at index " + i);
											console.log(err);
											return;
										}
									};
									res.json({
										success : true,
										message : "Succesfully Updated Note"
									});
								}
							});
						} else {
							res.json({
								success : true,
								message : "Succesfully Updated Note"
							});
						}
					}
				});
			} else if(req.body.removeusers) {
				// update users in removeusers
				var removeusers = req.body.removeusers.split(",");
				for(var i = 0; i < removeusers.length; i++) {
					removeusers[i] = { _id : removeusers[i] };
				}
				exports.UserModel.find().or(removeusers).exec( function(err,rUsers) {
					if (err) {
						res.json({
							success : false,
							message : err
						});
						console.log("Error Here at updateNote 6");
						console.log(err);
					} else {
						for (var i = rUsers.length - 1; i >= 0; i--) {
							rUsers[i].removeNote(note._id);
							var err = rUsers[i].save();
							if(err) {
								res.json({
									success : false,
									message : err
								});
								return;
							}
							console.log("Error Here at updateNote 7 at index " + i);
							console.log(err);
						};
						res.json({
							success : true,
							message : "Succesfully Updated Note"
						});
					}
				});
			} else {
				note.save(function(err) {
					if (err) {
						res.json({
							success : false,
							message : err
						});
						console.log("Error Here at updateNote 7");
						console.log(err);
					} else
						res.json({
							success : true,
							message : "Succesfully Updated Note"
						});
				});
			}
		}
	});
	*/
}; // updateNote END

// Delete Note
exports.deleteNote = function(req,res) {
	var noteID = req.body.noteID;
	Note.findById(mongoose.Types.ObjectId(noteID)).exec(function (err, note) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at deleteNote 1");
			console.log(err);
		}
		else
			// Remove note from each user's notes field
			UserModel.find( { _id : { $in : note.users } } ).exec(function(err, users) {
				if (err) {
					res.json({
						success : false,
						message : err
					});
					console.log("Error Here at deleteNote 1");
					console.log(err);
				} else {
					for(var i = 0; i < users.length; i++) {
						var user = users[i];
						user.removeNote(note._id);
						var err = user.save();
						if (err) {
							res.json({
								success : false,
								message : err
							});
							console.log("Error Here at deleteNote 2 at index " + i);
							console.log(err);
							return;
						}
					}
					note.remove();
					res.json({
						success : true,
						message : "Succesfully Deleted Note"
					});
				}
			});
	});
}; // deleteNote END