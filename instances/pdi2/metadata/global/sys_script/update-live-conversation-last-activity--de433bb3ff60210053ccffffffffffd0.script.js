updateGroupMessageActivity();

function updateGroupMessageActivity() {
	if (current.group.nil())
		return;
	var groupGR = new GlideRecord("live_group_profile");

	/* user posting the message may not be a member of the group for table notifications
	so disabling visibility business rules */
	groupGR.setWorkflow(false);
	groupGR.addQuery("sys_id", current.group);
	groupGR.queryNoDomain();

	if(!groupGR.next())
		return;

	groupGR.last_activity = gs.nowDateTime();
	groupGR.update();
}
