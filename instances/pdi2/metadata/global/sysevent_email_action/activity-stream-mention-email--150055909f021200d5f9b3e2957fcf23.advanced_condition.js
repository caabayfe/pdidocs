function shouldSend() {
	var liveGroupProfileGR = new GlideRecord("live_group_profile");
	liveGroupProfileGR.setWorkflow(false);
	liveGroupProfileGR.addQuery("document", current.document);
	liveGroupProfileGR.addQuery("table", current.table);
	liveGroupProfileGR.addQuery("type", "!=", "support");
	liveGroupProfileGR.query();

	if(liveGroupProfileGR.next()) {
		var liveGroupMemberGR = new GlideRecord("live_group_member");
		liveGroupMemberGR.setWorkflow(false);
		liveGroupMemberGR.addQuery("group", liveGroupProfileGR.getUniqueValue());
		liveGroupMemberGR.addQuery("member", current.profile);
		liveGroupMemberGR.addQuery("state", "!=", "inactive");
		liveGroupMemberGR.query();

		if(liveGroupMemberGR.next()) {
			return false;
		}
	}

	var SecurityManager = new SNC.LiveFeedSecurityManager();
	return SecurityManager.canReadField(current.user, current.table, current.document, current.field_name);
}

shouldSend();
