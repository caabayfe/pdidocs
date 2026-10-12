(function executeRule(current, previous /*null when async*/) {
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

	// If no cloud user is retrieved ignore this insert
	if (cloudUserID === "") {
		gs.info("No cloud user found");
		return;
	}

	// Compare values, make sure both are strings
	if (current.user.toString() === cloudUserID.toString()){
		gs.info("Clearing cloud user property as it has been marked read only");
		GlidePropertiesDB.set("sn_atf_tg.username", "");
		return;
	}
})(current, previous);
