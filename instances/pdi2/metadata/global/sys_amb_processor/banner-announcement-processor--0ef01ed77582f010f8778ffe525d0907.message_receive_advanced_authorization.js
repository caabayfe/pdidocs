function /*boolean*/ authorizeReceive(/*String*/ channel, /*UnmodifiableMap<String, Object>*/ message, /*String*/ sender, /*String*/ recipient) {
	var operation = String(message.get("operation"));
	var exemptOperations = ['m2m_delete', 'announcement_delete', 'config_delete', 'config_change']; 
	var incorrectDates = message.get("incorrect_dates"); //edge case - end date changes from valid to invalid
	
	//Skip permissions check if table operation doesn't require it
	if (exemptOperations.indexOf(operation) != -1 || incorrectDates) {
		return true;
	}
	
	var ann_roles = message.get("new_record").get("roles");
	var ann_groups = message.get("new_record").get("group");
	var show_for = message.get("new_record").get("show_for");
	
	if (show_for != 'specified_users') {
		return true;	
	}
	
	ann_roles = ann_roles == null ?  [] : ann_roles.split(',');
	ann_groups = ann_groups == null ? [] : ann_groups.split(', ');
	var user = gs.getUser(recipient);
	
	var hasAccess = false;
	
	//Give user access if it has valid role
	for (i = 0; i < ann_roles.length; i++) {
		var role = ann_roles[i];
		var gr = new GlideRecord('sys_user_role');
		gr.get('role');
		role = gr.getValue('name');
		if (user.hasRoleExactly(role)) {
			hasAccess = true;
			break;
		}
	}
	if (hasAccess) {
		return hasAccess;
	}

	//Give user access if it has valid group
	for (i = 0; i < ann_groups.length; i++) {
		var group = ann_groups[i];
		if (user.isMemberOf(group)) {
			hasAccess = true;
			break;
		}
	}	

	return hasAccess;
}
