(function executeRule(current, previous /*null when async*/) {
	
	var gr = new GlideRecord("sys_cs_context_profile_promotion");
	gr.addQuery("context_profile", current.getValue("context_profile"));
	gr.query();
	return gr.getRowCount() < 6;

})(current, previous);
