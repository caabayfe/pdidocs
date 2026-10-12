(function() {
	//if you're not an app_template_runner you can't see template instnaces
	if (!gs.hasRole('app_template_runner'))
		return false;
	
	//app_template_admin can read all template instances
	if (gs.hasRole('app_template_admin'))
		return true;
	
	//otherwise you can see the instance if it was created by you
	if (gs.getUserName() === current.getValue('sys_created_by'))
		return true;
}());
