var ChatApp = ChatApp || {};
ChatApp.ViewModel = function (){

    var messages = ko.observableArray([]);

    return {
        messages : messages
    }
}