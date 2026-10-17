answer = false;
if (gs.hasRole('maint'))
	answer = true;
else if (!current.write_roles.nil())
    answer = gs.hasRole(current.write_roles);
