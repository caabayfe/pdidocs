(function executeRule(current, previous /*null when async*/) {

	// Search up cloud user that was set in sys properties
	var cloudUser = gs.getProperty("sn_atf_tg.username", null);
	if (cloudUser === null || cloudUser === "")
		return;
	
	// Find the cloud user's sys id
	var cloudUserID = "";
	var gr = new GlideRecord("sys_user");
	gr.addQuery("user_name", cloudUser);
	gr.query();
	if (gr.next())
		cloudUserID = gr.sys_id;

	// If no cloud user is retrieved, it is because its record does not exist and QED is invalid
	if (cloudUserID === "") {
		gs.info("Clearing cloud user property as the user was deleted");
		GlidePropertiesDB.set("sn_atf_tg.username", "");
		return;
	}

	// Compare values, make sure both are strings
	if (current.user.toString() === cloudUserID.toString()){
		gs.info("Clearing cloud user property as it does not have admin role anymore");
		GlidePropertiesDB.set("sn_atf_tg.username", "");
		return;
	}

})(current, previous);
