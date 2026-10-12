(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("mid_profile_cluster_m2m");
	gr.addQuery("cluster", current.cluster);
	gr.addQuery("profile", current.profile);
	gr.addQuery("sys_id", "!=", current.getUniqueValue());
	gr.query();
	if (gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Profile cluster already exists with name: {0}", current.cluster.name));
	}

})(current, previous);
