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

io.on('connection', function(socket){

    io.emit('connectMsg', 'A user connected');

    socket.on('disconnect', function(){
        console.log('A user disconnected');
    });
});


http.listen(3000, function(){
    console.log('listening on *:3000');

});

