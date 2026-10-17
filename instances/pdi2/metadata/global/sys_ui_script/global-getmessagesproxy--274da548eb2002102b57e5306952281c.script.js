function getMessages(messages) {
    var result = {};
    if (messages) {
        messages.forEach(function(message) {
            result[message] = gs.getMessage(message);
        });
    }
    return result;
}

csGlobals['getMessages'] = getMessages;
