(function(current, previous, gs, action) {
	var changeRequest = ChangeRequest.newEmergency();
	changeRequest.setValue("short_description", current.short_description);
	changeRequest.setValue("description", current.description);
	changeRequest.setValue("cmdb_ci", current.cmdb_ci);
	if (changeRequest.hasValidChoice('priority', current.priority))
		changeRequest.setValue("priority", current.priority);
	changeRequest.setValue("sys_domain", current.sys_domain);
	changeRequest.setValue("company", current.company);
	changeRequest.insert();

	current.rfc = changeRequest.getGlideRecord().getUniqueValue();
	current.update();
	gs.addInfoMessage(gs.getMessage("Change {0} created", changeRequest.getValue("number")));
	action.setRedirectURL(changeRequest.getGlideRecord());
	action.setReturnURL(current);

})(current, previous, gs, action);
