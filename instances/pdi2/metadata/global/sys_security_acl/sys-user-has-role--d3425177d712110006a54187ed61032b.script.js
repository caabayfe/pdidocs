var rmAPI = new SNC.RoleManagementAPI();
if (!rmAPI.isAllowedToGrantRole(current.role))
	answer = false;
else
	answer = true;
