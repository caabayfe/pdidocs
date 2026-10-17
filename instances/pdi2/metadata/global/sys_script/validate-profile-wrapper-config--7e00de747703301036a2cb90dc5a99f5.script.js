(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("mid_profile_wrapper_config");
	gr.addQuery("name", current.name);
	gr.addQuery("profile", current.profile);
	gr.addQuery("sys_id", "!=", current.getUniqueValue());
	gr.query();
	if (gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Profile wrapper config already exists with name: {0}", current.name));
	}
	
})(current, previous);
