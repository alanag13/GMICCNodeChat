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

var getUserIndex = function(id){
    return _.findIndex(users, function(userIn){
        return userIn.id == id;
    });
}

io.on('connection', function (socket) {

    //subscribe a user to all events only after they've created a username
    socket.on('submit-username', function (user) {

         var self = this;

        //check to see if a username is already taken, or if this user already sumbitted a username
         var userExists = _.find(users, function(userIn){
            return (userIn.username == user.toUpperCase() || userIn.id == this.id);
         });

        if (!userExists) {
            users.push({username : user.toUpperCase(), displayText : user, id : self.id, typing : false});


        //every time someone connects, set it up so that
        //every time they send a message, we tell all connected clients
        //that we recieved it (and what it was)
        self.on('message-sent', function (msg) {
            io.emit('message-received', msg);
        });

        //when as user starts or stops typing, broadcast
        //the change in number of users typing to everyone connected
        self.on('user-typing-status-update', function(isTyping){

            var currentUserIdx = getUserIndex(self.id);

            if(isTyping && currentUserIdx != -1){
                users[currentUserIdx].typing = true;
            }else if (!isTyping && currentUserIdx != -1){
                users[currentUserIdx].typing = false;   
            }

            var typingUsers = _.where(users, { typing : true });

            var numberTyping = 0;
            if (typingUsers.length){
                numberTyping = typingUsers.length;
            }

            io.emit('set-number-typing-users', users[currentUserIdx].displayText, numberTyping);
        });

        self.on('disconnect', function(){
            var currentUserIdx = getUserIndex(self.id);
            io.emit('user-logged-off', users[currentUserIdx].displayText, users.length);
            //sign the user off
            _.remove(users, function(userIn){
                return userIn.id == self.id;
            });
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