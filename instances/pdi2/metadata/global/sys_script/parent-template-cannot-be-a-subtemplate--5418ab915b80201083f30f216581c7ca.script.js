(function executeRule(current, previous /*null when async*/) {

	var parentTemplate = current.parent_template;
	var subtemplate = new GlideRecord("sys_app_subtemplate");
	subtemplate.addQuery("template", parentTemplate);
	subtemplate.query();

	if (subtemplate.next()) { 
		current.parent_template.setError("Parent template cannot be a sub-template itself");
		current.setAbortAction(true);
	}

})(current, previous);
