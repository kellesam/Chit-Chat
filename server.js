const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const api = require('./routes/api');
const firebase = require('firebase');

//  firebase setup
var config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};
firebase.initializeApp(config);

app.db = firebase.database();

var dbHelper = require('./helpers/database')(app);
app.dbHelper = dbHelper;

// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// Angular DIST output folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});

// API location
app.use('/api', api);

// Send all other requests to the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Catch socket connections over http server
io.on('connection', function(socket){
    console.log('User connected to global socket');

    socket.on('event', function(payload){
        switch(payload.type) {
            case 'user-joined':
                /*  payload = { type: 'user-joined',
                                room: string,
                                username: string,   }
                */

                // check if room exists and username is unique in db
                var user = dbHelper.addUser(payload.room, payload.username);
                user.then((result) => {
                    if (!result.error) {
                        // if yes, add the client socket to socket.room
                        console.log('User joined room ' + payload.room);
                        socket.join(payload.room);
                        socket.username = payload.username;
                        socket.room = payload.room;
                        //console.log(socket.rooms);

                        payload.room_info = result;
                        payload.room_info.users = Object.keys(result.users);
                        payload.success = true;
                        console.log(payload);
                         // emit to all sockets in room
                        io.to(payload.room).emit('event', payload);
                    } else {
                        payload.success = false;
                        if (result.error == 'room invalid') {
                            // if no, error:error_message to payload
                            payload.error = 'Room not found';
                        } else if (result.error == 'user exists') {
                            payload.error = 'User already exists';
                        } else if (result.error == 'userid cannot be empty string') {
                            payload.error = 'UserId is empty string';
                        }
                        // emit only to single client
                            console.log(socket.id);
                            io.to(socket.id).emit('event', payload);
                    }
                });
                break;

            case 'user-message':
                /*  payload = { type: 'user-message',
                                room: string
                                content: string }
                */

                console.log(payload);

                // check if the client socket has joined this room
                if (Object.keys(socket.rooms).indexOf(payload.room) > -1) {
                    // if yes, emit the entire payload to all sockets in room
                    io.to(payload.room).emit('event', payload);
                }

                break;
        }
    });


    socket.on('disconnect', function(){
        let event = {
            type: 'user-disconnect',
            username: socket.username,
            timeStamp: new Date()
        };

        // check if user joined a room before disconnecting
        if (socket.room) {
            io.to(socket.room).emit('event', event);

            // remove user from db
            var userDeleted = dbHelper.deleteUser(socket.room, socket.username);
            userDeleted.then((result) => {
                if (!result.error) {
                    // delete room if all users have left
                    if (result.userCount < 1) {
                        console.log('Room ' + socket.room + ' is now empty and will be deleted');
                        dbHelper.deleteRoom(socket.room);
                    }
                }
                else {
                    console.log("Error removing user " + socket.username + " from room " + socket.room);
                    console.log("Error message: " + result.error);
                }
            });
        } else {
            console.log('User disconnected from global socket');
        }
    });
});

//Set Port
const port = process.env.PORT || '3000';
app.set('port', port);

server.listen(port, () => console.log(`Running on localhost:${port}`));
