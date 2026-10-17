insertVAUser();

function insertVAUser() {
	var gr = new GlideRecord("sys_user");
	gr.addQuery("user_name", "virtual.agent");
	gr.query();
	if (!gr.next()) {
		// override data policies
		gr.setUseEngines(false);
		// bypass business rules
		gr.setWorkflow(false);
        // insert the default va user
		gr.initialize();
		gr.user_name = "virtual.agent";
		gr.first_name = "Virtual";
		gr.last_name = "Agent";
		gr.web_service_access_only = true;
		var sys_id = gr.insert();
		if (sys_id != null) {
			gs.log("Successfully created the default Virtual Agent user virtual.agent (" + gr.sys_id + ")");
		} else {
			gs.error("Failed to create the default Virtual Agent user");
			return;
		}
	}
	// store the user id to a sys property
	gs.setProperty("com.glide.cs.va.sys_user", gr.sys_id);
	gs.log("Successfully set the system property com.glide.cs.va.sys_user to the user virtual.agent (" + gr.sys_id + ")");
}
