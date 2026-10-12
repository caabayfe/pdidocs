(function executeRule(current, previous /*null when async*/) {

	var dismissedMembersGr = new GlideRecord("sys_cs_collab_member");
	dismissedMembersGr.addQuery("collab_chat", current.collab_chat);
	dismissedMembersGr.addQuery("dismissed", true);
	dismissedMembersGr.query();
	if (!dismissedMembersGr.hasNext())
		return;
	
	dismissedMembersGr.setValue("dismissed", false);
	dismissedMembersGr.updateMultiple();

})(current, previous);
