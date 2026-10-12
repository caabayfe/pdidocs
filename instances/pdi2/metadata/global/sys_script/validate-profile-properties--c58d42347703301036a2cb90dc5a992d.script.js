(function executeRule(current, previous /*null when async*/) {

	// Ensure Property name is unique
	var gr = new GlideRecord("mid_profile_property");
	gr.addQuery("name", current.name);
	gr.addQuery("profile", current.profile);
	gr.addQuery("sys_id", "!=", current.getUniqueValue());
	gr.query();
	if (gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Profile property already exists with name: {0}", current.name));
	}

})(current, previous);
