var rmAPI = new SNC.RoleManagementAPI();
if (!rmAPI.isAllowedToGrantRole(current.sys_id))
	answer = false;
else if ((current.name == 'maint' || current.name == "nobody") && !gs.hasRole('maint'))
	answer = false;
else
	answer = true;
