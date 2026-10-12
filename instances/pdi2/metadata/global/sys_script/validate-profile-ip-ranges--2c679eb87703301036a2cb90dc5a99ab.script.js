(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("mid_profile_ip_range_m2m");
	gr.addQuery("ip_range", current.ip_range);
	gr.addQuery("profile", current.profile);
	gr.addQuery("sys_id", "!=", current.sys_id);
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Profile IP range already exists with name: {0}", current.ip_range.name));
		current.setAbortAction(true);
	}

})(current, previous);
