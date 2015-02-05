var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//send index if at the root of the domain
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//for everything else send whatever matches the url of what was requested
app.get('/*', function (req, res){
    res.sendFile(__dirname + req.url)
})

//every time someone connects, set it up so that
//every time they send a message, we tell all connected clients
//that we recieved it (and what it was)
io.on('connection', function (socket) {
    socket.on('message-sent', function (msg) {
        io.emit('message-received', msg);
    });
});

http.listen(1337, function () {
    console.log('listening on *:1337');
});