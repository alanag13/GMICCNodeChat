var ChatApp = ChatApp || {};
ChatApp.ViewModel = function () {

    var messages = ko.observableArray([]);
    var userCount = ko.observable(0);
    var numUsersTyping = ko.observable(0);
    var inputboxText = ko.observable();
    var currentUserName = ko.observable();
    var submittedUserName;
    var isTyping = ko.observable(false);
    var lastKeypress = 0;


    var submitUserName = function (){

        var user = $('#screenname-input').val();
        submittedUserName = user;

        user = user.replace(/ /g, ''); //remove whitespace characters

        if (user && user.trim() != '') {
            socket.emit('submit-username', user);
        }
    }

    //only close the dialog and set the screenname if this newly arriving user is
    //the person who just made a screenname, otherwise this will close the dialog for
    //people in the middle of making screennames.
    var onUserNameCreate = function (user, count) {
        userCount(count);
        messages.push({ sender: "", message : '********** ' + user + ' joined the chat. ********** ' });
        
        if (user == submittedUserName) {
            currentUserName(user);
            $('#screenNameDialog').modal('hide');
        }    
    }

    //tell node that a user has started typing.
    //if after a short amount of time another key isn't pressed,
    //tell node the user has stopped typing.    
    var onStartTyping = function(){

         var currTime = new Date().getTime();
         timeSinceLastPress = currTime - lastKeypress;
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

    var onNumUsersTypingChange = function (user, count){
        numUsersTyping(count);
    }
    
    var sendMessage = function (){
        if (!inputboxText() || inputboxText().trim() == "") return false;
        socket.emit('message-sent', { sender: currentUserName(), message : inputboxText().trim() });
        inputboxText('');
        $('#msgArea').focus();
        return false;
    }

    var onMessageReceived = function (msg) {
        messages.push(msg);
        //scroll to the bottom after getting a new message
        $("html, body").animate({ scrollTop: $(document).height() }, 250);
    }

    var onUserNameReject = function (user) {
        //try a different name
    }

    var onUserDisconnect = function (user, count){
        userCount(count);
        messages.push({ sender: "", message : '********** ' + user + ' left the chat. ********** ' });
    }
    
    return {
        messages : messages,
        userCount : userCount,
        isTyping : isTyping,
        numUsersTyping: numUsersTyping,
        inputboxText : inputboxText,
        currentUserName : currentUserName,
        submitUserName : submitUserName,
        onUserNameCreate : onUserNameCreate,
        onStartTyping : onStartTyping,
        onNumUsersTypingChange : onNumUsersTypingChange,
        onUserNameReject : onUserNameReject,
        sendMessage : sendMessage,
        onMessageReceived : onMessageReceived,
        onUserDisconnect : onUserDisconnect
    }
};