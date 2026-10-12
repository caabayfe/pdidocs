function /*void*/ onSubscribe(/*String*/ channel, /*String*/ user) {
	var existingStatusRecord = new GlideRecord("interaction_agent_status");
	existingStatusRecord.addQuery("agent", gs.getUserID());
	existingStatusRecord.query();
	
	var sysId;
	if (existingStatusRecord.next()) {
		sysId = existingStatusRecord.getUniqueValue();
	} else {
		existingStatusRecord.setValue("agent", gs.getUserID());
		sysId = existingStatusRecord.insert();
	}
	
	gs.publishToUser(channel, {"status_record": sysId}, user);
}
