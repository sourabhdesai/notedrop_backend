var NoteData = function (mongoose, db) {

	var Note = db.model("Note", new mongoose.Schema(
		{
			text      : String,
			latlong   : [Number], // [ Latitude , Longitude ]
			radius    : Number,
			startDate : Number,
			endDate   : Number,
			users     : [mongoose.Schema.Types.ObjectId]
		}
	));

	this.model = Note;

	// CRUD Operations on Note Schema
	// Create a new Note
	NoteData.prototype.createNote = function(req,res) {
		var text      = req.body.text;
		var latitude  = parseFloat(req.body.latitude);
		var longitude = parseFloat(req.body.longitude);
		var radius    = parseFloat(req.body.radius);
		var startDate = parseFloat(req.body.startDate);
		var endDate   = parseFloat(req.body.endDate);
		var userIDs   = req.body.users.split(','); //O(n) operation ... Can't pass an array through post body
		for(var i = 0; i < userIDs.length; i++) {
			userIDs[i] = mongoose.Types.ObjectId(userIDs[i]);
		}
	
		var newNote       = new Note();
		newNote.text      = text;
		newNote.latlong   = [latitude,longitude];
		newNote.radius    = radius;
		newNote.startDate = startDate;
		newNote.endDate   = endDate
		newNote.users     = userIDs;

		newNote.save(function (err) {
			if (err)
				res.json({
					success : false,
					message : err
				});
			else
				for(var i = 0; i < userIDs.length; i++) {
					userIDs[i] = {
						_id : userIDs[i]
					};
				}
				UserModel.find().or(userIDs).exec(function (err,users) {
					if (err)
						res.json({
							success : false,
							message : err
						});
					else {
						for(var i = 0; i < users.length; i++) {
							users[i].notes.push(newNote); // O(users[i].notes.length) operation
							var err = users[i].save();
							if (err) {
								res.json({
									success : false,
									message : err
								});
								return;
							}
						}
						res.json({
							success : true,
							message : {
								ID : newNote._id
							}
						});
					}
				});
		});
	}; // createNote END

	// Read an existing Note's data
	NoteData.prototype.readNote = function(req,res) {
		var noteID = req.param("id");
		Note.findById(noteID).exec(function(err,note) {
			if (err)
				res.json({
					success : false,
					message : err
				});
			else
				res.json({
					success : true,
					message : note
				});
		});
	}; // readNote END

	// Update data on Note ... Can Update any field within Note document
	NoteData.prototype.updateNote = function(req,res) {
		var noteID = res.body.noteID;
		Note.findById(noteID).exec(function(err,note) {
			if (err)
				res.json({
					success : false,
					message : err
				});
			else {
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
				if (req.body.users) {
					var newusers = req.body.users.split(",");
					note.users = new Array(newusers.length);
					for(var i = 0; i < newusers.length; i++) {
						note.users[i] = mongoose.Types.ObjectId( newusers[i] );
					}
				}
				note.save(function(err) {
					if (err)
						res.json({
							success : false,
							message : err
						});
					else
						res.json({
							success : true,
							message : "Succesfully Updated Note"
						});
				});
			}
		});
	}; // updateNote END

	// Delete Note
	NoteData.prototype.deleteNote = function(req,res) {
		var noteID = req.body.noteID;
		Note.findById(noteID).exec(function (err, note) {
			if (err)
				res.json({
					success : false,
					message : err
				});
			else
				// Remove note from each user's notes field
				UserModel.find().or(note.users).exec(function(err, users) {
					if (err)
						res.json({
							success : false,
							message : err
						});
					else {
						for(var i = 0; i < users.length; i++) {
							var user = users[i];
							for (var a = 0; a < user.notes.length; a++) {
								if(user.notes[a].equals(note._id)) {
									user.notes.splice(a,1);
									break;
								}
							}
							var err = user.save();
							if (err) {
								res.json({
									success : false,
									message : err
								});
								return;
							}
						}
						res.json({
							success : true,
							message : "Succesfully Deleted Note"
						});
					}
				});
		});
	}; // deleteNote END
}

module.exports = NoteData;