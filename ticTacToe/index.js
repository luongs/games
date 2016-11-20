/*jslint node: true */
/*jshint esversion: 6 */    // allow es6 syntax
/*jslint browser:true */    // ignore document error
"use strict";

let express = require('express');
let app = express();
let http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

let numUsers = 0;
io.on('connection', function(socket){


    io.emit('connectMsg', ++numUsers);

    socket.on('pickQuadrant', function(data){
        socket.broadcast.emit('emitQuadrant', data);
    });

    socket.on('disconnect', function(){
        io.emit('disconnect', --numUsers);
    });
});


http.listen(3000, function(){
    console.log('listening on *:3000');

});

