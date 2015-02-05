var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];
var displayNames = [];

//send index if at the root of the domain
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//for everything else send whatever matches the url of what was requested
app.get('/*', function (req, res) {
    res.sendFile(__dirname + req.url)
});


io.on('connection', function (socket) {
    //every time someone connects, set it up so that
    //every time they send a message, we tell all connected clients
    //that we recieved it (and what it was)
    socket.on('message-sent', function (msg) {
        io.emit('message-received', msg);
    });
    
    //check to see if a username is already taken.
    socket.on('submit-username', function (user) {
        if (!users[user.toUpperCase()]) {
            users.push(user.toUpperCase());
            displayNames.push(user.sender);
            
            io.emit('screen-name-approved', user)

        //if it is, tell the user to pick a different one
        } else {
        user.socket.emit('screen-name-rejected', user)
        }
    });
});





http.listen(1337, function () {
    console.log('listening on *:1337');
});