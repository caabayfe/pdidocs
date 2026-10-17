(function executeRule(current, previous /*null when async*/) {

	var subtemplate = new GlideRecord("sys_app_subtemplate");
	subtemplate.addQuery("parent_template", current.template);
	subtemplate.query();
	
	if (subtemplate.hasNext()) {
		current.setAbortAction(true);
		current.template.setError("Sub-template cannot have sub-templates");
	}

})(current, previous);
