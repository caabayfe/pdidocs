(function calc(convGr, interactionGr, notificationGr) {
    //for normal interaction check if topic discovery happened or direct LA conversation    
    if (interactionGr.virtual_agent || interactionGr.agent_chat) {
        return true;
    }
    //for actionable notification which is not part of an existing conversation check if the status is either sent or completed.
    if (notificationGr.next()) {
        var notificationState = notificationGr.state;
        if (notificationState == 'completed' || notificationState == 'sent') {
            return true;
        }
    }
    return false;
})(convGr, interactionGr, notificationGr);
