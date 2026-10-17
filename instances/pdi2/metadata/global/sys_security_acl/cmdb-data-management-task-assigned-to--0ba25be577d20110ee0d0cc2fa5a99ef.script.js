if (gs.getUser().hasRole('data_manager_admin')) {
	answer = true;
} else {
	var currentUserId = gs.getUserID();
	var currentAssignmentGroupId = current.assignment_group;
	var groupGr = new GlideRecord('sys_user_grmember');
	groupGr.addQuery('group', currentAssignmentGroupId);
	groupGr.addQuery('user', currentUserId);
	groupGr.query();
	if (groupGr.next()) {
		answer = true;
	} else {
		answer = false;
	}
}
