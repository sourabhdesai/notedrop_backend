var mongoose  = null;
var User      = null;
exports.NotesModel = null;
exports.model = null;

exports.attatchMongoose = function(m) {
	mongoose = m;
};

exports.createModel = function(db) {

	var userSchema =  new mongoose.Schema(
		{
			username : String,
			password : String,
			notes    : [mongoose.Schema.Types.ObjectId]
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
			var newUser = new User();
			newUser.username = username;
			newUser.password = passhash;
			newUser.notes = new Array(0);
			newUser.save( function(err) {
				if (err) {
					res.json({
						success : false,
						message : err
					});
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
			console.log("Error Here at createUser 1");
			console.log(err);
		}
	});
}; // createUser END

// Read an existing User's data
exports.readUser = function(req,res) {
	var userID = req.param("id");
	User.findById(userID).exec( function(err, user) {
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
					notes : user.notes
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
			res.json({
				success : true,
				ID : user._id,
				note : user.notes
			});
		} else {
			res.json({
				success : false,
				message : "Couldn't Find User with given Username & Password"
			});
		}
	});
};

// Update data on User ... Currently for Adding New Message
exports.updateUser = function(req,res) {
	var userID = req.body.userID;
	User.findById(userID).exec( function(err, user) {
		if (err) {
			res.json({
				success : false,
				message : err
			});
			console.log("Error Here at updateUser 1");
			console.log(err);
		} else {
			var noteID = req.body.noteID;
			// Add new message to message array
			user.notes.push( mongoose.Types.ObjectId(noteID) ); // O(n) Operation ... We'll worry about that later
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
		}
	});
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
						res.json({
							success : true,
							message : "Successfully Deleted User"
						});
					}
				});
			}
		}
	});
}; // deleteUser END