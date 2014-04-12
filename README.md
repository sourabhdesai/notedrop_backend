# Notedrop API Documentation
- **BASE URL:** `http://notedrop-server.herokuapp.com/`

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
	- `friends`
		- Type : Array
		- Description
			- Array of User IDs that this User is friends with

#### Endpoints

- All CRUD Endpoints are implemented

##### Create User

###### Request

- **POST**
- `/user/create`
- Key Value Pairs
	- `username` : New User's Username
	- `password` : MD5 Hashed Password for new User's account

###### Response

- Success Response

	    {
		    success : true,
		    message : {
			    ID : (String of Database ID for newly created User)
		    }
	    }


- Failure Response:

	    {
		    success : false,
		    message : {
			    "message": (String Message Describing Error Here),
			    "name"   : (String of the Error Name),
			    "type"   : (String of the Object Type where the error occurred),
			    "value"  : (String of the value the cause the error),
			    "path"   : (String of the Path of the error)
		    }
	    }

##### Read User

###### Request

- **GET**
- `/user/get/(id)`
	- `id` = Database ID for User who's info you want to retrieve

###### Response

- Success Response:

	    {
		    success : true,
		    message : {
			    username : (String of Username)
			    notes    : (Array of String IDs for Notes belonging to User)
			    friends  : (Array of String IDs for Users that this User is friends with)
		    }
	    }

- Failure Response:

	    {
		    success : false,
		    message : {
			    "message": (String Message Describing Error Here),
			    "name"   : (String of the Error Name),
			    "type"   : (String of the Object Type where the error occurred),
			    "value"  : (String of the value the cause the error),
			    "path"   : (String of the Path of the error)
		    }
	    }

##### Login User

###### Request

- **PUT**
- `/user/login`
- Key Value Pairs
	- `username` : User's username
	- `password` : User's Hashed Password

###### Response

- Success Response:

	    {
		    success : true,
		    message : {
			    ID      : (Array of User Objects for this User of the following form
				    [
					    {
						    username : (String of the username for the friend)
						    ID       : (String of the Database ID for the friend)
					    },… 
				    ] 
			    ),
			    notes   : (Array of Notes Objects for this user of the following form
				    [
					    {
						    text      : (String of Textual Content of Note),
						    latlong   : (Array of length 2 in the form of [Latitude , Longitude] ),
						    radius    : (Number indicating radius for Note notification),
						    startDate : (Number indicating start time for Note notification in milliseconds),
						    endDate   : (Number indicating end time for Note notification in milliseconds),
						    users     : (Array of String representing Database IDs for Users who are to be Notified for this note),
						    _id       : (String of Database ID for the note),
						    __v       : (Number for Version Key for Document … Don't worry about this, it's only meaningful internally)
					    },… 
				    ]
			    ),
			    friends : (Array of String IDs for Users that this User is friends with)
		    }
	    }

- Failure Response:

	    {
		    success : false,
		    message : {
			    "message": (String Message Describing Error Here),
			    "name"   : (String of the Error Name),
			    "type"   : (String of the Object Type where the error occurred),
			    "value"  : (String of the value the cause the error),
			    "path"   : (String of the Path of the error)
		    }
	    }


##### Update User

- Currently Only adds new Note to User's Notes Field
- For adding **new** notes to a user's account, **DO NOT** use this endpoint. To do that, use the *Create* endpoint for the Notes schema. Use this endpoint to add *currently existing* notes to a user.

###### Request

- **PUT**
- `/user/update`
- Key Value Pairs
	- `newfriends` : Comma Seperated List of User IDs that this User wants to add to their friends list
	- `removefriends` : Comma seperated List of User IDs that this User wants to remove from their friends list
	- `newnotes` : Comma seperated list of Note IDs that this user wants to add to their notes list
	- `removenotes` : Comma seperated list of Note IDs that this user wants to remove from their notes list

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
			    "message": (String Message Describing Error Here),
			    "name"   : (String of the Error Name),
			    "type"   : (String of the Object Type where the error occurred),
			    "value"  : (String of the value the cause the error),
			    "path"   : (String of the Path of the error)
		    }
	    }

##### Delete User

- Deletes User from Database and Removes Any Pointers to User via relational IDs
	- Goes through each note for the User and removes the User from that Note's `users` array

###### Request

- **PUT**
- `/user/delete`
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
			    "message": (String Message Describing Error Here),
			    "name"   : (String of the Error Name),
			    "type"   : (String of the Object Type where the error occurred),
			    "value"  : (String of the value the cause the error),
			    "path"   : (String of the Path of the error)
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
- `/note/create`
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
			    ID : (String of Database ID for newly created Note)
		    }
	    }

- Failure Response:

	    {
		    success : false,
		    message : {
			    "message": (String Message Describing Error Here),
			    "name"   : (String of the Error Name),
			    "type"   : (String of the Object Type where the error occurred),
			    "value"  : (String of the value the cause the error),
			    "path"   : (String of the Path of the error)
		    }
	    }

##### Read Note

###### Request

- **GET**
- `/note/get/(id)`
	- `id` = Database ID for the Note that you want to retrieve info for

###### Response

- Success Response:

	    {
		    success : true,
		    message : {
			    text      : (String of Textual Content of Note),
			    latlong   : (Array of length 2 in the form of [Latitude , Longitude] ),
			    radius    : (Number indicating radius for Note notification),
			    startDate : (Number indicating start time for Note notification in milliseconds),
			    endDate   : (Number indicating end time for Note notification in milliseconds),
			    users     : (Array of String representing Database IDs for Users who are to be Notified for this note),
			    _id       : (String of Database ID for the note),
			    __v       : (Number for Version Key for Document … Don't worry about this, it's only meaningful internally)
		    }
	    }

- Failure Response:

	    {
		    success : false,
		    message : {
			    "message": (String Message Describing Error Here),
			    "name"   : (String of the Error Name),
			    "type"   : (String of the Object Type where the error occurred),
			    "value"  : (String of the value the cause the error),
			    "path"   : (String of the Path of the error)
		    }
	    }

##### Update Note

###### Request

- **PUT**
- `/note/update`
- Key Value Pairs
	- **NOTE: ALL OF THE FOLLOWING KEY VALUE PAIRS ARE OPTIONAL. HOWEVER, THERE MUST AT LEAST BE ONE**
	- `noteID` : Database ID for the note that you want to update
	- `text` : New Textual content for Note
	- `latitude` : New Latitude of Note
	- `longitude` : New Longitude of Note
	- `radius` : New Radius of Note
	- `startDate` : New Milliseconds since January 1, 1970 indicating time when the note should become *active*
	- `endDate` : New Milliseconds since January 1, 1970 indicating time when the note should become *inactive*
	- `newusers` : Comma seperated list of User ID's for whom you want to **add** for notification of the Note. These users **MUST NOT** already be added to the list of users for the note, or else they will be double counted. **NO WHITESPACE**
	- `removeusers` : Comma seperated list of User ID's for whom you want to **remove** for notification of the note. These users **MUST** be in the list of users for the note, or else a database error will occurr. **NO WHITESPACE**

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
			    "message": (String Message Describing Error Here),
			    "name"   : (String of the Error Name),
			    "type"   : (String of the Object Type where the error occurred),
			    "value"  : (String of the value the cause the error),
			    "path"   : (String of the Path of the error)
		    }
	    }
	    
##### Delete Note

- Deletes Note and Also removes Note from Note array for All linked Users

###### Request

- **PUT**
- `/note/delete`
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
			    "message": (String Message Describing Error Here),
			    "name"   : (String of the Error Name),
			    "type"   : (String of the Object Type where the error occurred),
			    "value"  : (String of the value the cause the error),
			    "path"   : (String of the Path of the error)
		    }
	    }