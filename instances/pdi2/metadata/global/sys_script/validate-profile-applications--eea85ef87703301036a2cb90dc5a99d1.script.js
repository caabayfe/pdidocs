(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("mid_profile_application_m2m");
	gr.addQuery("application", current.application);
	gr.addQuery("profile", current.profile);
	gr.addQuery("sys_id", "!=", current.getUniqueValue());
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Profile application already exists with name: {0}", current.application.name));
		current.setAbortAction(true);
	}
	
})(current, previous);
