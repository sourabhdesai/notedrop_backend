var mongoose       = null;
var User           = null;
exports.NotesModel = null;
exports.model      = null;
var async          = require('async');

exports.attatchMongoose = function(m) {
	mongoose = m;
};

exports.createModel = function(db) {

	var userSchema =  new mongoose.Schema(
		{
			username : String,
			password : String,
			notes    : [mongoose.Schema.Types.ObjectId],
			friends  : [mongoose.Schema.Types.ObjectId]
		}
	);

	userSchema.methods.removeNote = function(id) {
		for(var i = 0; i < this.notes.length; i++) {
			if( this.notes[i].equals(id) ) {
				this.notes.splice(i,1);
				return;
			}
		}
	};

	userSchema.methods.removeFriend = function(id) {
		for (var i = this.friends.length - 1; i >= 0; i--) {
			if ( id == this.friends[i] ) {
				this.friends.splice(i,1);
				return;
			}
		};
	};

	User = db.model("User", userSchema);

	exports.model = User;	
};

// CRUD Operations on User Schema
// Create a new User
exports.createUser = function(req,res) {
	var username = req.body.username;
	var passhash = req.body.password; // MD5 Hashed Password
	User.findOne( { username : username } ).exec(function(err, user) {
		if (err == null && user == null) {
			// This is actually a good thing here!
			// If err & user is equal to null, then it means the query couldn't find any users with the same username
			var newUser      = new User();
			newUser.username = username;
			newUser.password = passhash;
			newUser.notes    = new Array(0);
			newUser.friends  = new Array(0);
			newUser.save( function(err) {
				if (err) {
					res.json({
						success : false,
						message : err
					});
					console.log("Error Here at createUser 1");
					console.log(err);
				} else {
					res.json({
						success : true,
						message : {
							ID : newUser._id
						}
					});
				}
			});
		}
		else if(user) {
			res.json({
				success : false,
				message : "Username already exists"
			});
		} else if(err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at createUser 2");
			console.log(err);
		}
	});
}; // createUser END

// Read an existing User's data
exports.readUser = function(req,res) {
	var userID = req.param("id");
	User.findById(mongoose.Types.ObjectId(userID)).exec( function(err, user) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at readUser 1");
			console.log(err);
		} else if(user) {
			res.json({
				success : true,
				message : {
					username : user.username,
					notes : user.notes,
					friends : user.friends
				}
			});
		} else {
			res.json({
				success : false,
				message : "Couldn't Find User with given ID"
			});
		}
	});
}; // readUser END

exports.loginUser = function(req,res) {
	var username = req.body.username;
	var passhash = req.body.password;
	User.findOne({
		username : username,
		password : passhash
	}).exec( function(err, user) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at loginUser 1");
			console.log(err);
		} else if(user) {
			if(user.friends.length > 0) {
				User.find().or(user.friends).exec(function(err, friends) {
					if (err) {
						res.json({
							success : false,
							message : err
						});
						console.log("Error Here at loginUser 2");
						console.log(err);
					}
					else {
						var friendArray = new Array(friends.length);
						for(var i = 0; i < friendArray.length; i++) {
							friendArray[i] = { 
								username : friends[i].username,
								ID : friends[i]._id,
								friends : friends[i].friends
							};
						}
						if (user.notes.length > 0) {
							exports.NotesModel.find().or(user.notes).exec(function(err, notes) {
								if (err) {
									res.json({
										success : false,
										message : err
									});
									console.log("Error Here at loginUser 3");
									console.log(err);
								}
								else if(notes) {
									res.json({
										success : true,
										message : {
											ID : user._id,
											friends : friends,
											notes : notes
										}
									});
								} else {
									res.json({
										success : false,
										message : "Couldn't Find any Notes corresponding to Note IDs for this User"
									});
								}
							});
						} else {
							res.json({
								success : true,
								message : {
									ID : user._id,
									friends : friends,
									notes : []
								}
							});
						}
					}
				});
			} else {
				if(user.notes.length > 0) {
					exports.NotesModel.find( { _id : { $in : user.notes } } ).exec(function(err, notes) {
						if (err) {
							res.json({
								success : false,
								message : err
							});
							console.log("Error Here at loginUser 4");
							console.log(err);
						} else if (notes) {
							res.json({
								success : true,
								message : {
									ID : user._id,
									friends : [],
									notes : notes
								}
							});
						} else {
							res.json({
								success : false,
								message : "Couldn't Find any Notes corresponding to Note IDs for this User"
							});
						}
					});
				} else {
					res.json({
						success : true,
						message : {
							ID : user._id,
							friends : [],
							notes : []
						}
					});
				}
			}
		} else {
			res.json({
				success : false,
				message : "Couldn't Find User with given Username & Password"
			});
		}
	});
};

exports.findUser = function(req, res) {
	var username = req.body.username;
	User.findOne({
		username : username
	}).exec(function(err, user) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at findUser 1");
			console.log(err);
		} else if (user) {
			if (user.friends.length > 0) {
				exports.NotesModel.find().or(user.friends).exec(function(err, friends) {
					if (err) {
						res.json({
							success : false,
							message : err
						});
						console.log("Error Here at findUser 2");
						console.log(err);
					} else if (friends) {
						for(var i = 0; i < friends.length; i++) {
							friends[i] = {
								username : friends[i].username,
								ID : friends[i]._id,
								friends : friends[i].friends
							};
						}
						res.json({
							success : true,
							message : {
								ID : user._id,
								friends : friends
							}
						});
					} else {
						res.json({
							success : false,
							message : {
								ID : user._id,
								friends : []
							}
						});
					}
				});
			} else {
				res.json({
					success : false,
					message : {
						ID : user._id,
						friends : []
					}
				});
			}
		}
	});
};

// Update data on User ... Currently for Adding New Message and Adding new Friend
exports.updateUser = function(req,res) {
	var userID = req.body.userID;
	var updates = {};
	if (req.body.newfriends) {
		var newfriendsArray = req.body.newfriends.split(',');
		for(var i = 0; i < newfriendsArray.length; i++) {
			newfriendsArray[i] = mongoose.Types.ObjectId(newfriendsArray[i]);
		}
		updates["$pushAll"] = {
			friends : newfriendsArray
		};
	}
	if (req.body.removefriends) {
		var removefriendsArray = req.body.removefriends.split(',');
		for(var i = 0; i < removefriendsArray.length; i++) {
			removefriendsArray[i] = mongoose.Types.ObjectId( removefriendsArray[i] );
		}
		updates["$pullAll"]= {
			friends : removefriendsArray
		};
	}
	if (req.body.newnotes) {
		var newnotesArray = req.body.newnotes.split(',');
		for(var i = 0; i < newnotesArray.length; i++) {
			newnotesArray[i] = mongoose.Types.ObjectId( newnotesArray[i] );
		}
		if(! "$pushAll" in updates )
			updates["$pushAll"] = {};
		updates["$pushAll"].notes = newnotesArray;
	}
	if (req.body.removenotes) {
		var removenotesArray = req.body.removenotes.split(',');
		for(var i = 0; i < removenotesArray.length; i++) {
			removenotesArray[i] = mongoose.Types.ObjectId( removenotesArray[i] );
		}
		if(! "$pullAll" in updates )
			updates["$pullAll"] = {};
		updates["$pullAll"].notes = removenotesArray;
	}
	User.update( { _id : userID }, updates ).exec(function(err) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at updateUser 1");
			console.log(err);
		} else {
			// Remove user from user.notes
			User.findById( mongoose.Types.ObjectId(userID) ).exec(function(err, user) {
				if (err) {
					res.json({
						success : false,
						message : err
					});
					console.log("Error Here at updateUser 2");
					console.log(err);
				} else if(user) {
					var pushFriends = null, pullFriends = null,
						pushNotes = null, pullNotes = null;
					var funcArray = [];
					if (req.body.newfriends) {
						pushFriends = User.update( { _id : { $in : updates.$pushAll.friends } }, { $push : { friends : user._id } }).exec;
						funcArray.push(pushFriends);
					}
					if (req.body.removefriends) {
						pullFriends = User.update( { _id : { $in : updates.$pullAll.friends } }, { $pull : { friends : user._id } }).exec;
						funcArray.push(pullFriends);
					}
					if (req.body.newnotes) {
						pushNotes = exports.NotesModel.update( { _id : { $in : updates.$pushAll.notes } }, { $push : { users : user._id } }).exec;
						funcArray.push(pushNotes);
					}
					if (req.body.removenotes) {
						pullNotes = exports.NotesModel.update( { _id : { $in : updates.$pullAll.notes } }, { $pull : { users : user._id } }).exec;
						funcArray.push(pullNotes);
					}
					if (funcArray.length == 0) {
						res.json({
							success : true,
							message : "Successfully Updated User"
						});
					} else {
						async.series(funcArray, function(err) {
							if (err) {
								res.json({
									success : false,
									message : err
								});
								console.log("Error Here at updateUser 3");
								console.log(err);
							} else {
								res.json({
									success : true,
									message : "Successfully Updated User"
								});
							}
						});
					}
				} else {
					res.json({
						success : false,
						message : "Couldn't Find User with given ID"
					});
				}
			});
		}
	});
	/*
	User.findById(userID).exec( function(err, user) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at updateUser 1");
			console.log(err);
		} else if (user) {
			if( req.body.newfriends != null && req.body.removefriends != null ) {
				var newfriends     = req.body.newfriends.split(',');
				var removefriends  = req.body.removefriends.split(',');
				var newUserFriends = new Array( user.friends.length - removefriends.length + newfriends.length );
				// Add All Objects in note.users that aren't in removeusers to newNoteUsers
				for(var i1 = 0, i2 = 0; i1 < user.friends.length - newUserFriends.length; ) {
					var friendsString = user.friends[i2].toString();
					for(var a = 0; a < removefriends.length; i++) {
						if ( removefriends[a] && removeFriends[a] == friendsString ) {
							removefriends[a] = null;
							user.friends[i2] = null;
							break;
						}
					}
					if (user.friends[i2]) {
						// Wasn't removed ... add it to the new array
						newUserFriends[i1] = user.friends[i2];
						i1++;
						i2++;
					} else {
						i2++;
					}
				}
				// Add All Objects in newusers to remaining indexes of newNoteUsers
				for(var i = user.friends.length - removefriends.length, a = 0; i < newUserFriends; i++) {
					newNoteUsers[i] = mongoose.Types.ObjectId( newusers[a] );
					a++;
				}
				user.friends = newUserFriends;
			} else if (req.body.newfriends) {
				var newFriendsIDs = req.body.newfriends.split(",");
				// Add new friend to friends array
				var newUserIDs = new Array( user.friends.length + newFriendsIDs.length );
				for(var i = 0; i < user.friends.length; i++) {
					newUserIDs[i] = user.friends[i];
				}
				for(var i = user.friends.length; i < newUserIDs.length; i++) {
					newUserIDs[i] = mongoose.Types.ObjectId( newFriendsIDs[i] );
				}
				user.friends = newUserIDs; // O(n) Operation ... We'll worry about that later
			} else if (req.body.removefriends) {
				var removeFriends = req.body.removefriends.split(",");
				var removeFriendsIDs = new Array( user.friends.length - removeFriends.length );
				for(var i = 0, n = 0; i < user.friends.length;) {
					var idString = user.friends[n].toString();
					for( var a = 0; a < removeFriends.length; a++ ) {
						if ( user.friends[a] && idString == removeFriends[a] ) {
							removeFriends = null;
							user.friends[n] = null;
							break;
						}
					}
					if ( user.friends[n] ) {
						removeFriendsIDs[i] = user.friends[n];
						n++;
						i++;
					} else {
						n++;
					}
				}
			}
			if ( req.body.newnotes != null && req.body.removenotes != null ) {
				var newnotes     = req.body.newnotes.split(',');
				var removenotes  = req.body.removenotes.split(',');
				var newUserNotes = new Array( user.notes.length - removenotes.length + newnotes.length );
				// Add All Objects in note.users that aren't in removeusers to newNoteUsers
				for(var i1 = 0, i2 = 0; i1 < user.notes.length - newUserNotes.length; ) {
					var notesString = user.notes[i2].toString();
					for(var a = 0; a < removenotes.length; i++) {
						if ( removenotes[a] && removeNotes[a] == notesString ) {
							removenotes[a] = null;
							user.notes[i2] = null;
							break;
						}
					}
					if (user.notes[i2]) {
						// Wasn't removed ... add it to the new array
						newUserNotes[i1] = user.notes[i2];
						i1++;
						i2++;
					} else {
						i2++;
					}
				}
				// Add All Objects in newusers to remaining indexes of newNoteUsers
				for(var i = user.notes.length - removenotes.length, a = 0; i < newUserNotes; i++) {
					newUserNotes[i] = mongoose.Types.ObjectId( newnotes[a] );
					a++;
				}
				user.notes = newUserNotes;
			} else if (req.body.newnotes) {
				var noteIDs = req.body.newfriends.split(",");
				// Add new friend to friends array
				var newUserIDs = new Array( user.friends.length + noteIDs.length );
				for(var i = 0; i < user.friends.length; i++) {
					newUserIDs[i] = user.friends[i];
				}
				for(var i = user.friends.length; i < newUserIDs.length; i++) {
					newUserIDs[i] = mongoose.Types.ObjectId( noteIDs[i] );
				}
				user.friends = newUserIDs; // O(n) Operation ... We'll worry about that later
			} else if (req.body.removenotes) {
				var removeNotes = req.body.removenotes.split(",");
				var removeNotesIDs = new Array( user.notes.length - removeNotes.length );
				for(var i = 0, n = 0; i < user.notes.length;) {
					var idString = user.notes[n].toString();
					for( var a = 0; a < removeNotes.length; a++ ) {
						if ( user.notes[a] && idString == removeNotes[a] ) {
							removeNotes = null;
							user.notes[n] = null;
							break;
						}
					}
					if ( user.notes[n] ) {
						removeNotesIDs[i] = user.notes[n];
						n++;
						i++;
					} else {
						n++;
					}
				}
			}

			// Save changes to user
			user.save(function(err) {
				if (err) {
					res.json({
						success : false,
						message : err
					});
					console.log("Error Here at updateUser 2");
					console.log(err);
				} else {
					res.json({
						success : true,
						message : "Successfully Added Message to User"
					});
				}
			});
		} else {
			res.json({
				success : false,
				message : "Couldn't find any Users with the given Username"
			});
		}
	});
	*/
}; // updateUser END

// Delete User
exports.deleteUser = function(req,res) {
	var userID = req.body.userID;

	User.findById(userID).exec(function(err, user) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error at deleteUser 1");
			console.log(err);
		}
		else {
			console.log(user);
			if(user.notes.length > 0) {
				exports.NotesModel.find().or(user.notes).exec( function (err, notes) {
					if (err) {
						res.json({
							success : false,
							message : err
						});
						console.log("error here at deleteUser 2");
						console.log(err);
					} else {
						for( var i = 0; i < notes.length; i++) {
							var note = notes[i];
							note.removeUser(user._id); // O(note.users) operation
							var err = note.save();
							if (err) {
								res.json({
									success : false,
									message : err
								});
								console.log("error Here at deleteUser 3");
								console.log(err);
								return;
							}
						}
						// Delete from Friends
						User.find().or(user.friends).exec(function(err, friends) {
							if (err) {
								res.json({
									success : false,
									message : err
								});
								console.log("Error Here at deleteUser 4");
								console.log(err);
							} else if (friends) {
								for(var i = 0; i < friends.length; i++) {
									friends[i].removeFriend(user._id);
									var err = friends[i].save();
									if (err) {
										res.json({
											success : false,
											message : err
										});
										console.log("Error Here at deleteUser 5 at index " + i);
										console.log(err);
										return;
									}
								}
								user.remove();
								res.json({
									success : true,
									message : "Successfully Deleted User"
								});
							} else {
								res.json({
									success : false,
									message : "Couldn't find friends for user " + user._id
								});
							}
						});
					}
				});
			}
		}
	});
}; // deleteUser END