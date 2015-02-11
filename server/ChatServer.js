var _ = require('lodash');
var chatObj = require('./ChatObjects');

var ChatServer = ChatServer || function(users, io){

	if(!io) console.error('A socket.io server is required.');

	var users = users || [];

	var getUser = function(id){
		return _.find(users, function(userIn){
			return userIn.id == id;
		});
	}

	var tryAddUser = function (user, userId, callbacks){
		  //check to see if a username is already taken, or if this user already sumbitted a username
         var foundUser = _.find(users, function(userIn){
            return (userIn.username == user.toUpperCase() || userIn.id == userId);
         });
         //add them to them the server if the name doesn't already exist there
        if (!foundUser) {
            users.push(chatObj.createUser(user, userId));
            var message = chatObj.createMessage(' joined the chat.', 'join', user);

            io.emit('screen-name-approved', user, users.length, message);
		}

		foundUser ? callbacks.fail() : callbacks.success(); 

		return !foundUser;
	}

	var updateTypingStatus = function (isTyping, userId){
		var currentUser = getUser(userId);

		if(isTyping && currentUser){
			currentUser.typing = true;
		}else if (!isTyping && currentUser){
			currentUser.typing = false;   
		}

		if(currentUser){
			var typingUsers = _.where(users, { typing : true });

			var numberTyping = 0;
			if (typingUsers.length){
				numberTyping = typingUsers.length;
			}

			io.emit('set-number-typing-users', currentUser.displayText, numberTyping);
		}

	}

	var receiveMessage = function (msg, userId){
		var currentUser = getUser(userId);

		if(currentUser){
			var message = chatObj.createMessage(msg, 'keyed', currentUser.displayText);
			io.emit('message-received', message);
		}
	}

	var onUserDisconnect = function (userId){
		var currentUser = getUser(userId);
		var userName = currentUser.displayText;
        var message = chatObj.createMessage(' left the chat.', 'info', currentUser.displayText);

        //sign the user off
        _.remove(users, function(userIn){
        	return userIn.id == userId;
        });

        io.emit('user-logged-off', message, users.length);

	}

	return {
		tryAddUser : tryAddUser,
		updateTypingStatus : updateTypingStatus,
		receiveMessage : receiveMessage,
		onUserDisconnect : onUserDisconnect
	}
}

module.exports.create = function(users, io){
	return new ChatServer(users, io);
}