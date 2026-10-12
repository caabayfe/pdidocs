(function executeRule(current, previous /*null when async*/) {

	var template = current.template;
	var templateRecord = new GlideRecord("sys_app_template");
	if (templateRecord.get(template)) {
		if (templateRecord.create_app) {
			current.setAbortAction(true)
			current.template.setError("Sub-template cannot be an application template");
		}
	}

})(current, previous);
