(function executeRule(current, previous) {
    try {
        var provenance = current.conversation.provenance ? current.conversation.provenance.toString() : null;
        var userId = current.conversation.consumer.user_id.toString();

        // Impersonate as conversation user
        var previousUser = gs.getSession().impersonate(userId);

        try {
            var result = sn_cs.VASystemObject.getUnreadMessageCountForNAPByProvenance(provenance);

            gs.publish("/nap/unread/message/count/" + userId, {
                "conversationCount": parseInt(result)
            });
        } finally {
            gs.getSession().impersonate(previousUser);
        }


    } catch (ex) {
        gs.error("Failed to publish unread notification count");
    }
})(current, previous);
