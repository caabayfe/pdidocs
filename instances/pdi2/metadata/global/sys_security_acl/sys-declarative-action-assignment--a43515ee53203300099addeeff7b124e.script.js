answer = false;
if(gs.hasRole("maint") || gs.hasRole("evam_admin") || current.sys_created_by == gs.getUserName() || current.isNewRecord())
	answer = true;
