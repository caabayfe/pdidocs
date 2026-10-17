checkDelete();

function checkDelete() {
	gs.print("Checking delete of group " + current.name);
	
	// Delete of ALL group is not allowed
	if (current.name == "All") {
		current.setAbortAction(true);
		gs.addInfoMessage(gs.getMessage("The 'All' group cannot be deleted"));
		gs.print("Deletion of group 'All' aborted");
		return;
	}
	
	// If the are child business services or child group, do not allow to delete the group.
	var gr = new GlideRecord("cmdb_ci_service_group");
	gr.addQuery("parent_group", current.sys_id);
	gr.query();
	if (gr.hasNext()) {
		current.setAbortAction(true);
		gs.addInfoMessage(gs.getMessage("Group having child groups can not be deleted"));
	} else {
		// Check if there are child business services
		var membersGr = new GlideRecord("sa_service_group_member");
		membersGr.addQuery("service_group",current.sys_id);
		membersGr.query();
		if (membersGr.hasNext()) {
			current.setAbortAction(true);
			gs.addInfoMessage(gs.getMessage("Group having child business services can not be deleted"));
		}
	}
}
