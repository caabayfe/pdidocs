(function(current, previous, gs, action) {
	var target = {};
	target.table = current.getTableName();
	target.sysid = current.getUniqueValue();
	target.field = 'rfc';
	try {
		target.isWorkspace = (typeof RP == 'undefined');
	}
	catch (err) {
		target.isWorkspace = false;
	}

	gs.getSession().putProperty('change_link', target);

	var changeRequest = ChangeRequest.newEmergency();
	changeRequest.setValue("short_description", current.short_description);
	changeRequest.setValue("description", current.description);
	changeRequest.setValue("cmdb_ci", current.cmdb_ci);
	if (changeRequest.hasValidChoice('priority', current.priority))
		changeRequest.setValue("priority", current.priority);
	changeRequest.setValue("sys_domain", current.sys_domain);
	changeRequest.setValue("company", current.company);
	changeRequest.insert();

	action.setReturnURL(current);
	action.setRedirectURL(changeRequest.getGlideRecord());

})(current, previous, gs, action);
