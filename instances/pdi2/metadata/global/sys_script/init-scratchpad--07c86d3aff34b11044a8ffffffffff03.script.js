(function executeRule(current, previous /*null when async*/) {
	var connInstanceUtil = new ConnectorInstanceUtil();
	var assnGroupSupportEnabled = connInstanceUtil.isAssignmentGroupSupportEnabled();
	var assnGroupAdminRoles = connInstanceUtil.getAssignmentGroupAdminRoles();

	g_scratchpad.assignmentGroupSupportEnabled = assnGroupSupportEnabled ? 'true' : 'false';
	g_scratchpad.assignmentGroupAdminRoles = assnGroupAdminRoles;

})(current, previous);
