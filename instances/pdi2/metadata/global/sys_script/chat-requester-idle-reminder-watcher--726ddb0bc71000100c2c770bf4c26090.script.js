(function executeRule(current, previous /*null when async*/ ) {
    var conversationID = current.getValue("topic");
    // Only send reminder if the requestor is in live chat mode and not messaging type
    if (sn_cs.VASystemObject.isLiveChatInProgress(conversationID) && sn_cs.VASystemObject.getInteractionType(conversationID) == 'chat')
        sn_cs.VASystemObject.sendReminder(conversationID);
})(current, previous);
