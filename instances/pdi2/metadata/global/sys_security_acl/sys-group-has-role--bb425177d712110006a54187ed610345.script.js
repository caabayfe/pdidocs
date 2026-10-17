var rmAPI = new SNC.RoleManagementAPI();
if (!rmAPI.isAllowedToGrantGroup(current.group))
	answer = false;
else
	answer = true;
