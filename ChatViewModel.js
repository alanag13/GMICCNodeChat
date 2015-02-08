var ChatApp = ChatApp || {};
ChatApp.ViewModel = function () {

    var messages = ko.observableArray([]);
    var userCount = ko.observable(0);
    var inputboxText = ko.observable();
    var currentUserName = ko.observable();
    var submittedUserName;


    var submitUserName = function (){

        var user = $('#screenname-input').val();
        submittedUserName = user;

        user = user.replace(/ /g, ''); //remove whitespace characters

        if (user && user.trim() != '') {
            socket.emit('submit-username', user);
        }
    }

    var onUserNameCreate = function (user, count) {
        //if the user name wasn't already taken let the user start chatting
        //also announces the arrival of new users
        userCount(count);
        messages.push({ sender: "", message : '********** ' + user + ' joined the chat. ********** ' });
        
        //only close the dialog and set the screenname if this newly arriving user is
        //the person who just made a screenname, otherwise this will close the dialog for
        //people in the middle of making screennames.
        if (user == submittedUserName) {
            currentUserName(user);
            $('#screenNameDialog').modal('hide');
        }    
    }
    
    var sendMessage = function (){
        if (!inputboxText() || inputboxText().trim() == "") return false;
        socket.emit('message-sent', { sender: currentUserName(), message : inputboxText().trim() });
        inputboxText('');
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
        inputboxText : inputboxText,
        currentUserName : currentUserName,
        submitUserName : submitUserName,
        onUserNameCreate : onUserNameCreate,
        onUserNameReject : onUserNameReject,
        sendMessage : sendMessage,
        onMessageReceived : onMessageReceived,
        onUserDisconnect : onUserDisconnect
    }
};