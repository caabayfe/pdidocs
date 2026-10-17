(function executeRule(current, previous /*null when async*/ ) {
	var visibleByAllRoles = current.role_override;
	var sharedWithRoles = (current.visible_to =='2' && !current.roles);
	var sharedWithGroupsAndUsers = (current.visible_to == '3' && !current.groups && !current.users);
	g_scratchpad.isIndicatorInvisible = (!visibleByAllRoles && (sharedWithRoles || sharedWithGroupsAndUsers));
	g_scratchpad.warningMessage = gs.getMessage('This indicator is visible to anyone who can edit indicators. Other users cannot see the scores. To expand visibility, authorise roles, groups, or users in the Access control tab.');

})(current, previous);
