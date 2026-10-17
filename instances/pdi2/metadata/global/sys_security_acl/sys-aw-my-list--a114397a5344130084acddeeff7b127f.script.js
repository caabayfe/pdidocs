if (gs.hasRole('workspace_admin') || (current != null && current.sys_created_by == gs.getUserName()))
	answer = true;
