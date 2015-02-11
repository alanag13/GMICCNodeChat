var ChatApp = ChatApp || {};
ChatApp.ViewModel = ChatApp.ViewModel || function (ko, socket) {

    if(!ko || !socket){
        console.error("knockout and socket.io are required dependencies.")
        return;
    }

    var proposedUsername = ko.observable('');
    var messages = ko.observableArray([]);
    var userCount = ko.observable(0);
    var numUsersTyping = ko.observable(0);
    var inputboxText = ko.observable();
    var currentUserName = ko.observable();
    var submittedUserName;
    var isTyping = ko.observable(false);
    var lastKeypress = 0;


    var submitUsername = function (){
        var user = proposedUsername().replace(/ /g, ''); //remove whitespace characters
        submittedUserName = user;

        if (user && user.trim() != '') {
            socket.emit('submit-username', user);
        }
    }

    var sendMessage = function (callback){
        if (!inputboxText() || inputboxText().trim() == "") return false;
        socket.emit('message-sent', inputboxText().trim());
        inputboxText('');
        if(isFunction(callback)) callback();
        return false;
    }

    //tell node that a user has started typing.
    //if after a short amount of time another key isn't pressed,
    //tell node the user has stopped typing.    
     var onStartTyping = function (){

           var currTime = new Date().getTime();
           lastKeypress = currTime;

           if(! isTyping()){
             socket.emit('user-typing-status-update', true); 
            }

            var lastKeypressBeforeTimeoutStart = lastKeypress;

             setTimeout(function(){
                if (lastKeypress == lastKeypressBeforeTimeoutStart){
                    isTyping(false);
                    socket.emit('user-typing-status-update', false); }
                }, 650);

         isTyping(true);
         return true;
    }

var serverEvents = {
    //only close the dialog and set the screenname if this newly arriving user is
    //the person who just made a screenname, otherwise this will close the dialog for
    //people in the middle of making screennames.
         onUsernameCreate : function (user, count, msg, callback) {
            userCount(count);
            messages.push(msg);
            if(isFunction(callback)) callback();
        },


        onNumUsersTypingChange : function (user, count){
            numUsersTyping(count);
        },

        onMessageReceived : function (msg, callback) {
            messages.push(msg);
            if(isFunction(callback)) callback();
        },

        onUsernameReject : function (user) {
                //try a different name
        },

        onUserDisconnect : function (msg, count){
            userCount(count);
            messages.push(msg);
        }
 }   
    
    return {
        messages : messages,
        userCount : userCount,
        numUsersTyping: numUsersTyping,
        inputboxText : inputboxText,
        currentUserName : currentUserName,
        submitUsername : submitUsername,
        proposedUsername : proposedUsername,
        sendMessage : sendMessage,
        onStartTyping : onStartTyping,
        serverEvents : serverEvents
    }
};

////////////////////////////////////////////////////////////////////
function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}