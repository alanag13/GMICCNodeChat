var ChatObjects = ChatObjects || {};
ChatObjects.Message = ChatObjects.Message || function(message, type, from){
	return {
		message : message,
		type : type,
		from : from
	}
}
ChatObjects.User = ChatObjects.User || function(username, userId){
	return {
		username : username.toUpperCase(),
		displayText : username,
		id : userId,
		typing : false
	}
}

module.exports.createUser = function(username, userId){
	return new ChatObjects.User(username, userId);

}
module.exports.createMessage = function(message, type, from){
	return new ChatObjects.Message(message, type, from);
}