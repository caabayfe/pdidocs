(function executeRule(current, previous /*null when async*/) {

	var grp = new GlideRecord('sys_user_grmember');
	grp.addQuery('group', current.getValue('assignment_group'));
	grp.addQuery('user', current.getValue('assigned_to'));
	grp.query();

	if(!grp.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Assigned to user {0} must be member of Assignment group {1} ",[current.getDisplayValue('assigned_to'),current.getDisplayValue('assignment_group')]));
		current.setAbortAction(true);
	}

})(current, previous);
