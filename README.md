# Notedrop API Documentation

## Schemas

### User

- Fields
	- `username`
		- Type : *String*
		- Description
			- Username of User
	- `password`
		- Type : *String*
		- Description
			- Password of User stored as MD5 Hash
	- `notes`
		- Type : *Array*
		- Description
			- Array of Note IDs that this User has pending

#### Endpoints

- All CRUD Endpoints are implemented

##### Create User

###### Request

- **POST**
- `/createuser`
- Key Value Pairs
	- `username` : New User's Username
	- `password` : MD5 Hashed Password for new User's account

###### Response

- Success Response:
	    {
		    success : true,
		    message : {
			    ID : <String of Database ID for newly created User>
		    }
	    }
- Failure Response:
	    {
		    success : false,
		    message : {
			    "message": <String Message Describing Error Here>,
			    "name": <String of the Error Name>,
			    "type": <String of the Object Type where the error occurred>,
			    "value": <String of the value the cause the error>,
			    "path": <String of the Path of the error>
		    }
	    }

##### Read User

###### Request

- **GET**
- `/getuser/<id>`
	- `id` = Database ID for User who's info you want to retrieve

###### Response

- Success Response:
	    {
		    success : true,
		    message : {
			    username : <String of Username>
			    notes : <Array of String IDs for Notes belonging to User>
		    }
	    }
- Failure Response:
	    {
		    success : false,
		    message : {
			    "message": <String Message Describing Error Here>,
			    "name": <String of the Error Name>,
			    "type": <String of the Object Type where the error occurred>,
			    "value": <String of the value the cause the error>,
			    "path": <String of the Path of the error>
		    }
	    }

##### Update User

- Currently Only adds new Note to User's Notes Field
- For adding **new** notes to a user's account, **DO NOT** use this endpoint. To do that, use the *Create* endpoint for the Notes schema. Use this endpoint to add *currently existing* notes to a user.

###### Request

- **PUT**
- `/addnote`
- Key Value Pairs
	- `userID` : Database ID for User that you want to update
	- `noteID` : Database ID for Note that you want to add to User's notes array

###### Response

- Success Response:
	    {
		    success : true,
		    message : "Successfully Added Message to User"
	    }
- Failure Response:
	    {
		    success : false,
		    message : {
			    "message": <String Message Describing Error Here>,
			    "name": <String of the Error Name>,
			    "type": <String of the Object Type where the error occurred>,
			    "value": <String of the value the cause the error>,
			    "path": <String of the Path of the error>
		    }
	    }

##### Delete User

- Deletes User from Database and Removes Any Pointers to User via relational IDs
	- Goes through each note for the User and removes the User from that Note's `users` array

###### Request

- **PUT**
- `/deleteuser`
- Key Value Pairs
	- `userID` : Database ID for User that you want to delete

###### Response

- Success Response:
	    {
		    success : true,
		    message : "Successfully Deleted User"
	    }
- Failure Response:
	    {
		    success : false,
		    message : {
			    "message": <String Message Describing Error Here>,
			    "name": <String of the Error Name>,
			    "type": <String of the Object Type where the error occurred>,
			    "value": <String of the value the cause the error>,
			    "path": <String of the Path of the error>
		    }
	    }


### Note

- Fields
	- `text`
		- Type : *String*
		- Description
			- Textual content of the Note
	- `latlong`
		- Type : *Array*
		- Description
			- Always an array of length 2 where the 0th index indicates latitude, and the 1st index indicates longitude. Used to describe location of Note notification
	- `radius`
		- Type : *Number*
		- Description
			- Used to describe *(in miles)* the radial distance from the `latlong` coordinate within which the Note should be notified.
	- `startDate`
		- Type : *Number*
		- Description
			- Number describing, in milliseconds since January 1, 1970 00:00:00.0 UTC, when this Note should *become* **active**.
	- `endDate`
		- Type : *Number*
		- Description
			- Number describing, in milliseconds since January 1, 1970 00:00:00.0 UTC, when this Note should become **inactive**.
	- `users`
		- Type : *Array*
		- Description
			- Array of User IDs for whom this Note should be notified

#### Endpoints

- All CRUD operations are implemented

##### Create Note

###### Request

- **POST**
- `/createnote`
- Key Value Pairs
	- `text` : Textual content for new Note
	- `latitude` : Latitude of new Note
	- `longitude` : Longitude of new Note
	- `radius` : Radius of new Note
	- `startDate` : Milliseconds since January 1, 1970 indicating time when the new note should become *active*
	- `endDate` : Milliseconds since January 1, 1970 indicating time when the new note should become *inactive*
	- `users` : Comma seperated list of User ID's for whom this new Note should be notified for. **NO WHITESPACES**

###### Response

- Success Response:
	    {
		    success : true,
		    message : {
			    ID : <String of Database ID for newly created Note>
		    }
	    }
- Failure Response:
	    {
		    success : false,
		    message : {
			    "message": <String Message Describing Error Here>,
			    "name": <String of the Error Name>,
			    "type": <String of the Object Type where the error occurred>,
			    "value": <String of the value the cause the error>,
			    "path": <String of the Path of the error>
		    }
	    }

##### Read Note

###### Request

- **GET**
- `/getnote/<id>`
	- `id` = Database ID for the Note that you want to retrieve info for

###### Response

- Success Response:
	    {
		    success : true,
		    message : {
			    text : <String of Textual Content of Note>,
			    latlong : <Array of length 2 in the form of [Latitude , Longitude] >,
			    radius : <Number indicating radius for Note notification>,
			    startDate : <Number indicating start time for Note notification in milliseconds>,
			    endDate : <Number indicating end time for Note notification in milliseconds>,
			    users : <Array of String representing Database IDs for Users who are to be Notified for this note>,
			    _id : <String of Database ID for the note>,
			    __v : <Number for Version Key for Document … Don't worry about this, it's only meaningful internally>
		    }
	    }
- Failure Response:
	    {
		    success : false,
		    message : {
			    "message": <String Message Describing Error Here>,
			    "name": <String of the Error Name>,
			    "type": <String of the Object Type where the error occurred>,
			    "value": <String of the value the cause the error>,
			    "path": <String of the Path of the error>
		    }
	    }

##### Update Note

###### Request

- **PUT**
- `/updatenote`
- Key Value Pairs
	- **NOTE: ALL OF THE FOLLOWING KEY VALUE PAIRS ARE OPTIONAL. HOWEVER, THERE MUST AT LEAST BE ONE**
	- `text` : New Textual content for Note
	- `latitude` : New Latitude of Note
	- `longitude` : New Longitude of Note
	- `radius` : New Radius of Note
	- `startDate` : New Milliseconds since January 1, 1970 indicating time when the note should become *active*
	- `endDate` : New Milliseconds since January 1, 1970 indicating time when the note should become *inactive*
	- `users` : New Comma seperated list of User ID's for whom this Note should be notified for. **NO WHITESPACE**

###### Response

- Success Response:
	    {
		    success : true,
		    message : "Successfully Updated Note"
	    }
- Failure Response:
	    {
		    success : false,
		    message : {
			    "message": <String Message Describing Error Here>,
			    "name": <String of the Error Name>,
			    "type": <String of the Object Type where the error occurred>,
			    "value": <String of the value the cause the error>,
			    "path": <String of the Path of the error>
		    }
	    }
	    
##### Delete Note

- Deletes Note and Also removes Note from Note array for All linked Users

###### Request

- **PUT**
- `/deletenote`
- Key Value Pairs
	- `noteID` : Database ID for Note that you want to delete

###### Response

- Success Response:
	    {
		    success : true,
		    message : "Successfully Deleted Note"
	    }
- Failure Response:
	    {
		    success : false,
		    message : {
			    "message": <String Message Describing Error Here>,
			    "name": <String of the Error Name>,
			    "type": <String of the Object Type where the error occurred>,
			    "value": <String of the value the cause the error>,
			    "path": <String of the Path of the error>
		    }
	    }