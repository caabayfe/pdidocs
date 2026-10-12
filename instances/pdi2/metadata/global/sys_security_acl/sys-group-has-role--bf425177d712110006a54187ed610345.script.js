var rmAPI = new SNC.RoleManagementAPI();
if (!rmAPI.isAllowedToGrantRole(current.role))
	answer = false;
else if (!rmAPI.isAllowedToGrantGroup(current.group))
	answer = false;
else
	answer = true;
