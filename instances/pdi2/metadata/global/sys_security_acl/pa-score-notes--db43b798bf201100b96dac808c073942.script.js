answer = true;
if (current.sys_created_by == 'system') // means this is a threshold comment
	answer = (current.user == '' || gs.getUser().getID() == current.user); // Global threshold or users personal threshold.
