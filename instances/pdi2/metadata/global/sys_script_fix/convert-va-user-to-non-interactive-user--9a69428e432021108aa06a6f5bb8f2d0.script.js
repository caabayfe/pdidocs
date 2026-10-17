convertToNonInteractive();

function convertToNonInteractive() {
	var gr = new GlideRecord("sys_user");
	gr.addQuery("user_name", "virtual.agent");
	gr.query();
	if (gr.next()) {
		// override data policies
		gr.setUseEngines(false);
		// bypass business rules
		gr.setWorkflow(false);
		gr.web_service_access_only = true;
		gr.update();
	} else {
		// "Insert Default User" script will enable web_service_access_only if VA user is not found
		gs.info("Failed to find user virtual.agent");
	}
}
