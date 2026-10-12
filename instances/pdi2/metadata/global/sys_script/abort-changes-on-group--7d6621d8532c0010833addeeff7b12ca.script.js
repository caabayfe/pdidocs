(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var assigned_to = current.assigned_to;
	var assignment_group = current.assignment_group;
	

	var grp = new GlideRecord('sys_user_grmember');
	grp.addQuery('group.sys_id', assignment_group);
	grp.addQuery('user', assigned_to);
	grp.query();

	if(!grp.hasNext())
	{
		gs.addErrorMessage(gs.getMessage("Assigned to user {0} must be member of Assignment group {1} ",[assigned_to.getDisplayValue(),assignment_group.getDisplayValue()]));
		current.setAbortAction(true);
	}


})(current, previous);
