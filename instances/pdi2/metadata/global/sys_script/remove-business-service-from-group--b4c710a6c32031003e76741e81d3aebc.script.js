removeFromGroup();

function removeFromGroup() {
	// Check if this is the last member of the group
	var gr = new GlideRecord("sa_service_group_member");
	gr.addQuery("service", current.service);
	gr.query();
	gs.print("Row count after delete is " + gr.getRowCount());
	if (gr.getRowCount() == 0) {
		// In case a business service is deleted, nothing we should do here
		var cmdbCiGr = new GlideRecord("cmdb_ci");
		cmdbCiGr.get(current.service);
		if (!cmdbCiGr.isValid())
			return;
		
		gs.print("Service was removed from last group. Need to add it to group 'All'");
		// If the last member, add this member to the All group
		var groupsGr = new GlideRecord("cmdb_ci_service_group");
		groupsGr.addQuery("name", "All");
		groupsGr.query();
		if (groupsGr.hasNext()) {
			gs.print("Adding service to group 'All'");
			groupsGr.next();
			var gr1 = new GlideRecord("sa_service_group_member");
			gr1.initialize();
			gr1.setValue("service", current.service);
			gr1.setValue("service_group", groupsGr.getValue("sys_id"));
			gr1.insert();
			gs.addInfoMessage(gs.getMessage("Service was added to 'All' group since it was removed from the last group. Note: Removing service from the last group and adding it to another group must be done in two separate steps; First step: add the service to the new group and update. Second step: remove the service from the old group and update."));
		} else {
			gs.print("Group 'All' not found!");
		}
	}
	
}
