
var users = [];

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var chatServer = require('./server/ChatServer').create(users, io);


//send index if at the root of the domain
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//for everything else send whatever matches the url of what was requested
//__dirname is a node constant for 'whatever directory this node script is running in'
app.get('/*', function (req, res) {
    res.sendFile(__dirname + req.url)
});

io.on('connection', function (socket) {
    //subscribe a user to all events only after they've created a username
    var loggedOn = false;

    if(! loggedOn){
        socket.on('submit-username', function (user) {

            var self = this;
            //if the logon works, subscribe to all the events the client sends
            loggedOn = chatServer.tryAddUser(user, self.id, {
                success : function (){
                    self.on('message-sent', function(msg){
                       chatServer.receiveMessage(msg, self.id);
                    });

                    self.on('user-typing-status-update', function(isTyping){
                        chatServer.updateTypingStatus(isTyping, self.id);
                    });

                    self.on('disconnect', function (){
                        chatServer.onUserDisconnect(self.id);
                    });
                },
                fail : function (){
                    self.broadcast.to(self.id).emit('screen-name-rejected', user)
                }
            });
        });
    }
});


//fire up the server!
http.listen(process.env.PORT || 1337, function () {
    console.log('listening on *:1337');
});