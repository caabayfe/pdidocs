var rmAPI = new SNC.RoleManagementAPI();

var roleName = rmAPI.getRoleNameById(current.role);

answer = true;
if (roleName === 'security_admin' && gs.hasRole('security_admin') == false) {
	answer = false;
}
