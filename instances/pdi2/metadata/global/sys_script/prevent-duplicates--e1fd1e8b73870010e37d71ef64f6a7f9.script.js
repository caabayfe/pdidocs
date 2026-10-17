(function executeRule(current, previous /*null when async*/) {

	var template = new GlideRecord(ActivityConstants.TABLE_ACTIVITY_TYPE_TEMPLATE);
	template.addQuery("activity_type", current.activity_type);
	if(current.sys_id)
		template.addQuery("sys_id", "!=", current.sys_id);
	template.query();
	if(template.hasNext()) {
		gs.addErrorMessage(gs.getMessage("A template record already exists for the given activity type."));
		current.setAbortAction(true);
	}

})(current, previous);
