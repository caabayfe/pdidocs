(function executeRule(current, previous /*null when async*/ ) {
    var chatLogger = new global.ChatLogger("", current.sys_id);
    if (!current.channel_metadata_document) {
        chatLogger.log("VA Phone Interaction - On Closed: channel_metadata_document field is empty");
        return;
    }
    if (current.state == 'closed_complete' || current.state == 'wrap_up') {
        sn_cs.VASystemObject.endConversation(current.channel_metadata_document);
    }
    if (current.state == 'closed_abandoned') {
        sn_cs.VASystemObject.faultConversation(current.channel_metadata_document, "", 
		"", current.state_reason, true);
    }
})(current, previous);
