(function executeRule(current, previous /*null when async*/) {

	var subtemplate = new GlideRecord("sys_app_subtemplate");
	subtemplate.addQuery("template", current.getUniqueValue());
	subtemplate.query();
	g_scratchpad.is_subtemplate = subtemplate.hasNext();

})(current, previous);
