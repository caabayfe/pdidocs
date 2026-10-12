(function executeRule(current, previous /*null when async*/) {
	if (!current.isNewRecord() && !current.resource_identifier.changes())
		return;

	var dup = new GlideRecord('oauth_protected_resource');
	dup.addQuery('resource_identifier', current.getValue('resource_identifier'));
	dup.addQuery('sys_id', '!=', current.getUniqueValue());
	dup.setLimit(1);
	dup.queryNoDomain();
	if (dup.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('A protected resource with identifier "{0}" already exists.', [current.getValue('resource_identifier')]));
	}
})(current, previous);
