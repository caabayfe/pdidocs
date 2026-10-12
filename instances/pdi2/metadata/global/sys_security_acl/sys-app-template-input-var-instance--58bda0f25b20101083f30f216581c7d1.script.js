(function() {
	if (gs.hasRole('app_template_admin'))
		return true;
	else if (gs.getUserName() === current.getValue('sys_created_by'))
		return true;
	else
		return false;
})();
