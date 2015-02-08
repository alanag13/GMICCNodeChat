var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');

var users = [];

//send index if at the root of the domain
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//for everything else send whatever matches the url of what was requested
app.get('/*', function (req, res) {
    res.sendFile(__dirname + req.url)
});


io.on('connection', function (socket) {

    //subscribe a user to all events only after they've created a username
    socket.on('submit-username', function (user) {

         var self = this;

        //check to see if a username is already taken, or if this user already sumbitted a username
         var userNameExists = _.find(users, function(userIn){
            return userIn.username == user.toUpperCase();
         });

        if (!users[self.id] && !userNameExists) {
            users.push({username : user.toUpperCase(), displayText : user, id : self.id});
            
        //every time someone connects, set it up so that
        //every time they send a message, we tell all connected clients
        //that we recieved it (and what it was)
        self.on('message-sent', function (msg) {
            io.emit('message-received', msg);
        });

        self.on('disconnect', function(){
            //sign the user off
            var user = _.find(users, function(userIn){
                return userIn.id == self.id;
            });

            _.remove(users, function(userIn){
                return userIn.id == self.id;
            });

            io.emit('user-logged-off', user.displayText, users.length);
        });
            
            io.emit('screen-name-approved', user, users.length)

        //if it is, tell the user to pick a different one
        } else {
         self.broadcast.to(self.id).emit('screen-name-rejected', user)
        }
    });
});





http.listen(process.env.PORT || 1337, function () {
    console.log('listening on *:1337');
});