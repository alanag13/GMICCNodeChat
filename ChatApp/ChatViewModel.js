var ChatApp = ChatApp || {};
ChatApp.ViewModel = function () {
    
    var messages = ko.observableArray([]);
    var inputboxText = ko.observable();
    
    return {
        messages : messages,
        inputboxText : inputboxText
    }
};