(function executeRule(current, previous /*null when async*/) {
	var emailAccessRestriction = new GlideRecord("email_access_restriction");
	emailAccessRestriction.addQuery("notification", current.notification);
	if (current.sys_id)
		emailAccessRestriction.addQuery("sys_id", "!=", current.sys_id);

	emailAccessRestriction.setLimit(1);
	emailAccessRestriction.query();
	if (emailAccessRestriction.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Invalid update. Email Access Restriction definition already exists for notification {0}", current.notification.getDisplayValue()));
		current.setAbortAction(true);
	}
})(current, previous);
