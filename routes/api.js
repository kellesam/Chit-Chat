var express = require('express');
var router = express.Router();
var dbHelper;
var jwt = require('express-jwt');
const cryptoRandomString = require('crypto-random-string');


// Stores firebase database reference in variable
router.use('/', function(req, res, next) {
  dbHelper = req.app.dbHelper;
  next();
});

// Success : code 200, room exists
// Failure : code 404, room does not exist
router.get('/rooms/:id', function(req, res) {
  var room = dbHelper.getRoom(req.params.id);
  room.then((result) => {
    if (result) {
      res.status(200).send();
    } else {
      res.status(404).end();      // Room not found
    }
  });
});

// test route
router.get('/rooms/obj/:id', function(req, res) {
  var room = dbHelper.getRoom(req.params.id);
  room.then((result) => {
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).end();      // Room not found
    }
  });
});

// Delete chatroom and associated room object
// Success: status 200, returns { 'success' : true }
// Failure: status 500
router.delete('/rooms/:id', function(req, res) {
  var room = dbHelper.deleteRoom(req.params.id);
  room.then((result) => {
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(500).end();
    }
  });
});

// Creates new room
// Success: status 201, returns room object
// Failure: status 409, room id already exists
router.post('/rooms', function (req, res) {
  var room = dbHelper.createRoom(cryptoRandomString(20));
  room.then((result) => {
    if (result) {
      res.status(201).json(result);
    } else {
      res.status(409).end();
    }
  });
});

// Adds user to room
// Route parameter: room id
// Expected body property: userId
// Success: status 200, returns updated room object
// Failure: status 404 or 409, returns { 'error' : '...' }
router.post('/rooms/:id/users', function (req, res) {
  var user = dbHelper.addUser(req.params.id, req.body.userId);
  user.then((result) => {
    if (!result.error) {
      res.status(200).json(result);
    } else {
      if (result.error == 'room invalid') {
        res.status(404).json(result);
      } else if (result.error == 'user exists') {
        res.status(409).json(result);
      }
    }
  });
});

// Removes user from  room
// Route parameters: room ID
// Expected body property: userId
// Success : status 200, returns updated room object
// Failure : status 404, returns { 'error' : '...' }
router.delete('/rooms/:id/users', function (req, res) {
  var user = dbHelper.deleteUser(req.params.id, req.body.userId);
  user.then((result) => {
    if (!result.error) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  });
});


module.exports = router;
