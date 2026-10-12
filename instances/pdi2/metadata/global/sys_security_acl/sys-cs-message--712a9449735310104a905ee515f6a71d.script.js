answer = canReadMessage();

function canReadMessage() {
	// If you made it, you can read it
	if (current.sys_created_by.equals(gs.getUserName())) {
		return true;
	}
	
	// If you're an interaction admin, you can read any messages you want
	var currentUser = gs.getUser();
	if (currentUser.hasRole('interaction_admin')) {
		return true;
	}
	
	// If you're a member of the conversation the message is in, you should be able to see it
	var agentTypes = ["public_fulfiller", "private_fulfiller", "observer"];
	var conversation = current.getValue("conversation");
	
	var conversationMemberGR = new GlideRecord("sys_cs_conversation_member");
	conversationMemberGR.setWorkflow(false);
	conversationMemberGR.addActiveQuery();
	conversationMemberGR.addQuery("conversation", conversation);
	if (current.getValue("visibility_type") == "agent_only") {
		conversationMemberGR.addQuery("member_type", "IN", agentTypes);
	} else if (current.getValue("visibility_type") == "requester_only") {
		conversationMemberGR.addQuery("member_type", "requester");
	}
	conversationMemberGR.addQuery("member.user_document", currentUser.getID());

	conversationMemberGR.query();
	
	if(conversationMemberGR.next()) {
		return true;
	}
	
	return false;
}
