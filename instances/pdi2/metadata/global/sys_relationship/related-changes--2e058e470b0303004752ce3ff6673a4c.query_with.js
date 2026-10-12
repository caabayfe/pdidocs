(function refineQuery(current, parent) {
	if (!current.isValidField("audit_delete")) {
		current.addQuery("number", "-1");
		return;
	}
	if (parent.delete_recovery.nil()) {
		current.addQuery("number", "-1");
		return;
	}
	current.addQuery("audit_delete", parent.sys_id).addOrCondition("audit_delete_path", "CONTAINS", parent.sys_id);
})(current, parent);
