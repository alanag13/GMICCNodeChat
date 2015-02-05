var ChatApp = ChatApp || {};
ChatApp.ViewModel = function () {
    
    var messages = ko.observableArray([]);
    var userCount = ko.observable(0);
    var inputboxText = ko.observable();
    var currentUserName = ko.observable();
    
    var submitUserName = function (){

        var user = $('#screenname-input').val();
        user = user.replace(/ /g, ''); //remove whitespace characters

        if (user && user.trim() != '') {
            socket.emit('submit-username', user);
        }
    }

    var onUserNameCreate = function (user) {
        
        //if the user name wasn't already taken let the user start chatting
        vm.currentUserName(user);
        vm.userCount(vm.userCount() + 1);    
        $('#screenNameDialog').modal('hide');
        socket.emit('message-sent', { sender: "", message : '********** ' + user + ' joined the chat. ********** ' });
    }
    
    var sendMessage = function (){
        if (!inputboxText() || inputboxText().trim() == "") return false;
        socket.emit('message-sent', { sender: currentUserName(), message : inputboxText() });
        inputboxText('');
        return false;
    }
    
    var onUserNameReject = function (user) {
        //try a different name
    }
        
    var onUserDisconnect = function (user){
        userCount(userCount()--);
        //x left the chat
    }
    
    return {
        messages : messages,
        userCount : userCount,
        inputboxText : inputboxText,
        currentUserName : currentUserName,
        submitUserName : submitUserName,
        onUserNameCreate : onUserNameCreate,
        sendMessage : sendMessage,
        onUserDisconnect : onUserDisconnect
    }
};