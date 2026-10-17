answer = false;
if (gs.hasRole("maint") || current.sys_created_by == gs.getUserName())
	answer = true;
