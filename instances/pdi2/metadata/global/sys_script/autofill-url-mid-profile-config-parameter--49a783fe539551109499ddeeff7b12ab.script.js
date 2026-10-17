(function executeRule(current, previous /*null when async*/) {
	var instanceUrl = gs.getProperty("glide.servlet.uri");
	var gr = new GlideRecord('mid_profile_config');
	gr.initialize();
	gr.setValue("profile", current.sys_id);
	gr.setValue("name", 'url');
	gr.setValue("value", instanceUrl);
	gr.insert();
})(current, previous);
