var userRoles = {};
for (const role of gs.getUser().getRoles()) {
	userRoles[role] = role;
}
if ('df_connection_admin' in userRoles || 'maint' in userRoles) {
	answer = true;
} else {
	var requireRoles = current.getValue("data_steward_roles");
	if (requireRoles)
		answer = requireRoles.toLowerCase().split(',').some(function(role) {
			return role in userRoles;
		});
	else
		answer = false;
}
