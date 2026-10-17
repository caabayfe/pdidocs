(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('mid_profile_capability_m2m');
	gr.addQuery("capability", current.capability);
	gr.addQuery("profile", current.profile);
	gr.addQuery("sys_id", "!=", current.getUniqueValue());
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Profile capability already exists with name: {0}", current.capability.capability));
		current.setAbortAction(true);
	}

})(current, previous);
