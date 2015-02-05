var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', function (socket) {
    socket.on('message-sent', function (msg) {
        io.emit('message-received', msg);
    });
});

http.listen(1337, function () {
    console.log('listening on *:1337');
});