// Any changes on group 'All' are not allowed
if (previous.name == 'All') {
    current.setAbortAction(true);
    gs.addInfoMessage(gs.getMessage("Changes on the group All are not allowed"));
}
var gr = new GlideRecord("cmdb_ci_service_group");
gr.addQuery("name",current.name);
gs.print("Group name is " + current.name);
gr.query();
if (gr.hasNext()) {
	gr.next();
    if (gr.getValue("sys_id") != current.sys_id) {
	    gs.print("Group already exists. " + gr.getValue("sys_id") + " current.sys_id: " + current.sys_id);
	    current.setAbortAction(true);
	    gs.addInfoMessage(gs.getMessage("Group by that name already exists"));
	}
} else {
	// if the parent is empty find the ALL group and set the parent
	if (!current.parent_group) {
		// Find the ALL group
		gr.initialize();
		gr.addQuery("name", "All");
		gr.query();
		if (gr.hasNext()) {
			gr.next();
			current.parent_group = gr.getValue("sys_id");
		}
	}
}
	
	
