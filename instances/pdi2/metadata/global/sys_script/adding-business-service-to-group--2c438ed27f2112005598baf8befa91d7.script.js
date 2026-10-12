checkIfRecordExists();

function checkIfRecordExists() {
	// Check if the service already belongs to the group
	var gr = new GlideRecord("sa_service_group_member");
	gr.addQuery("service", current.service);
	gr.addQuery("service_group", current.service_group);
	gr.query();
	if(gr.next())
		current.setAbortAction(true);
	
}
