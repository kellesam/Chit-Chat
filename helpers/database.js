module.exports = function(app) {
    var database = app.db;

    var dbHelper = {};

    // Returns room object from database
    dbHelper.getRoom = function(roomId) {
        var roomRef = database.ref('rooms/' + roomId);
        return roomRef.once('value').then(function(snapshot) {
            var roomObj = snapshot.val();
            if (snapshot.val()) {       // room exists, add in id
                roomObj.id = roomId;
            }
            return roomObj;
        });
    };

    // Converts a single room object when formatted as { "roomId" : { ... } }
    dbHelper.convertRoomObj = function(roomFB) {
        var roomId = Object.keys(roomFB)[0];
        return {
            id : roomId,
            created: roomFB[roomId].created,
            userCount: roomFB[roomId].userCount,
            users: roomFB[roomId].users
        };
    };


    // Creates room object with current timestamp
    // Success : returns room object
    // Failure : returns nothing if room id already exists
    dbHelper.createRoom = function(roomId) {
        var roomsRef = database.ref('rooms');
        var room = {
            [roomId] : {
                'created' : Date.now(),
                'userCount' : 0,
                'users' : {}
            }
        };

        // Check if room with id already exists
        return roomsRef.once('value')
        .then((snapshot) => {
            if (snapshot.hasChild(roomId)) {
                return Promise.reject('room already exists');
            } else {
                return room;
            }
        // Create new room and return object
        }).then(() => {
            return roomsRef.update(room);
        }).then(() => {
            return this.convertRoomObj(room);
        }).catch(function(error) {
            console.log(error);
        });
    };

    // Deletes room object
    // Success : returns { 'success' : true }
    // Failure : returns nothing, logs error
    dbHelper.deleteRoom = function(roomId) {
        var roomRef = database.ref('rooms/' + roomId);
        return roomRef.remove()
        .then(function() {
            return { 'success' : true };
        }).catch(function(err) {
            console.log('Room deletion failed with error ' + err.message);
        });
    };


    // Adds user to the database
    // Success : returns updated room object
    // Failure : returns { 'error' : 'room invalid' } or
    //           { 'error' : 'user exists' };
    dbHelper.addUser = function(roomId, userId) {
        var countRef = database.ref('rooms/' + roomId + '/userCount');
        var roomRef = database.ref('rooms/' + roomId);
        var usersRef = database.ref('rooms/' + roomId + '/users');
        userId = userId.trim();         // Trims whitespace from ends of userId
        if (userId.length == 0) {
            return { 'error' : 'userid cannot be empty string' };
        }
        var user = { [userId] : true };
        // Check if room exists, then if user exists
        return roomRef.once('value')
        .then((snapshot) => {
            if (snapshot.val() == null) {
                return Promise.reject('room invalid');
            } else if (snapshot.hasChild("users/" + userId)) {
                return Promise.reject('user exists');
            } else {
                return Promise.resolve(user);
            }
        // Add user
        }).then(() => {
            return usersRef.update(user);
        // Increment user count
        }).then(() => {
            return countRef.transaction(function(currCount) {
                currCount++;
                return currCount;
            });
        // Return room object
        }).then(() => {
            return this.getRoom(roomId);
        }).catch(function(error) {
            if (error == 'room invalid' || error == 'user exists') {
                return { 'error' : error };
            }
        });
    };

    // Deletes user from the database
    // Success : returns updated room object
    // Failure : returns { 'error' : 'room invalid' } or
    //           { 'error' : 'user does not exist' };
    dbHelper.deleteUser = function(roomId, userId) {
        var countRef = database.ref('rooms/' + roomId + '/userCount');
        var roomRef = database.ref('rooms/' + roomId);
        var userRef = database.ref('rooms/' + roomId + '/users/' + userId);
        // Check if room exists
        return roomRef.once('value')
        .then((snapshot) => {
            if (snapshot.val() == null) {
                return Promise.reject('room invalid');
                // Check if user exists
            } else if (!snapshot.hasChild("users/" + userId)) {
                return Promise.reject('user does not exist');
            }
        }).then(() => {
            return userRef.remove();
        }).then(() => {
            console.log("User " + userId + " deleted from room " + roomId);
        // Decrement user count
         }).then(() => {
            return countRef.transaction(function(currCount) {
                currCount--;
                return currCount;
            });
        // Return room object
        }).then(() => {
            return this.getRoom(roomId);
        }).catch(function(error) {
            if (error == 'room invalid' || error == 'user does not exist') {
                return { 'error' : error };
            }
        });
    };

    return dbHelper;
};
