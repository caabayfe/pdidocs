function /*boolean*/ authorizeReceive(/*String*/ channel, /*UnmodifiableMap<String, Object>*/ message, /*String*/ sender, /*String*/ recipient) {
 	var target = message.get("group") || message.get("event_target");
 	var groupGR = new GlideRecord("live_group_profile");

 	// Not group related
 	if (!target || !groupGR.get(target))
 		return true;

 	// We already know that a user is a member of the group if we've gotten here.  No reason for further
 	// checks if it's not a document group.
 	if(!groupGR.document_group)
 		return true;

 	var reflectedField = message.get("reflected_field");
 	if (reflectedField) {
        var userID = GlideSession.get().getUID();
 		if (new SNC.LiveFeedSecurityManager().canReadField(userID, groupGR.table, groupGR.document, reflectedField))
 		   return true;

        // Checks if we are in the midst of a Connect Support transfer, the accepting agent
        // may not have access to the record until after the transfer is complete.
        var transferGR = new GlideRecord("chat_queue_entry_transfer");
        transferGR.addQuery("group", target);
        transferGR.addQuery("state", "pending");
        transferGR.addQuery("transfer_to", userID);
        transferGR.query();
        return transferGR.next();
 	}

	return new SNC.LiveFeedSecurityManager().canReadDocument(groupGR);
}
